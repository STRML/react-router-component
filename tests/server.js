'use strict';
var assert    = require('assert');
var React     = require('react');
var Router    = require('../index');
var Location  = React.createFactory(Router.Location);
var Locations = React.createFactory(Router.Locations);
var Pages     = React.createFactory(Router.Pages);
var NotFound  = React.createFactory(Router.NotFound);
var Link      = React.createFactory(Router.Link);

describe('react-router-component (on server)', function() {

  var App = React.createClass({

    render: function() {
      return Locations({className: 'App', path: this.props.path},
        Location({
          path: '/',
          handler: function(props) { return React.DOM.div(null, 'mainpage'); }
        }),
        Location({
          path: '/x/:slug',
          handler: function(props) { return React.DOM.div(null, props.slug); }
        }),
        Location({
          path: /\/y(.*)/,
          handler: function(props) { return React.DOM.div(null, props._[0]);}
        }),
        NotFound({
          handler: function(props) { return React.DOM.div(null, 'not_found'); }
        })
      );
    }
  });

  App = React.createFactory(App);

  it('renders to /', function() {
    var markup = React.renderToString(App({path: '/'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/mainpage/));
  });

  it('renders to /:slug', function() {
    var markup = React.renderToString(App({path: '/x/hello'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/hello/));
  });

  it('renders with regex', function() {
    var markup = React.renderToString(App({path: '/y/ohhai'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/ohhai/));
  })

  it('renders to empty on notfound', function() {
    var markup = React.renderToString(App({path: '/notfound'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/not_found/));
  });

  describe('pages router', function() {

    var App = React.createClass({

      render: function() {
        return Pages({className: 'App', path: this.props.path},
          Location({
            path: '/',
            handler: function(props) { return React.DOM.div(null, 'mainpage') }
          })
        );
      }
    });


    it('renders to <body>', function() {
      var markup = React.renderToString(React.createElement(App, {path: '/'}));
      assert(markup.match(/<body [^>]+><div [^>]+>mainpage<\/div><\/body>/));
    });

  });

  describe('contextual router', function() {

    var ContextualRouter = React.createClass({

      render: function() {
        return Locations({className: 'X', contextual: true},
          Location({
            path: '/hello',
            handler: function(props) {
              return Link({href: '/hi'});
            }
          }),
          Location({
            path: '/hello2',
            handler: function(props) {
              return Link({global: true, href: '/hi'});
            }
           }),
           Location({
            path: '/hello3/*',
            handler: function(props) {
              return Locations({className: 'Y', contextual: true},
                Location({
                  path: '/:subslug',
                  handler: function(props) {
                    return Link({href: '/sup-' + props.subslug});
                  }
                })
              );
            }
          })
        )
      }
    });
    
    var App = React.createClass({

      render: function() {
        return Locations({className: 'App', path: this.props.path},
          Location({
            path: '/x/:slug/*',
            handler: ContextualRouter
          })
        );
      }
    });

    App = React.createFactory(App);

    it ('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/x/nice/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/x\/nice\/hi"/));
    });

    it ('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderToString(App({path: '/x/nice/hello2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/hi"/));
    });

    it ('renders Link component with href scoped to its nested context prefix', function() {
      var markup = React.renderToString(App({path: '/x/nice/hello3/welcome'}));
      assert(markup.match(/class="App"/));      
      assert(markup.match(/class="X"/));
      assert(markup.match(/class="Y"/));
      assert(markup.match(/href="\/x\/nice\/hello3\/sup-welcome"/));
    });

  });


  describe('nested contextual routers', function() {

    var Level2 = React.createClass({

      render: function() {
        var thisSlug = this.props.slug;
        return Locations({className: 'L2', contextual: true},
          Location({
            path: '/',
            handler: function(props) {
              return Link({href: '/hello', 'data-slug': thisSlug});
            }
          }),
          Location({
            path: '/:slug',
            handler: function(props) {
              return Link({global: true, href: '/hi', 'data-slug': props.slug});
            }
          })
        )
      }
    });

    var Level1 = React.createClass({

      render: function() {
        var thisSlug = this.props.slug;
        return Locations({className: 'L1', contextual: true},
          Location({
            path: '/',
            handler: function(props) {
              return Link({href: '/l2', 'data-slug': thisSlug});
            }
          }),
          Location({
            path: '/:slug(/*)',
            handler: Level2
          })
        )
      }
    });

    var App = React.createClass({

      render: function() {
        return Locations({className: 'App', path: this.props.path},
          Location({
            path: '/l1/:slug(/*)',
            handler: Level1
          })
        );
      }
    });

    it ('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/l1/nice'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it ('renders Link component with href scoped to its prefix - trailing slash', function() {
      var markup = React.renderToString(App({path: '/l1/nice/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it ('renders nested Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/l1/nice/l2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/l1\/nice\/l2\/hello"/));
      assert(markup.match(/data-slug="l2"/));
    });

    it ('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderToString(App({path: '/l1/nice/l2/foo'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/hi"/));
      assert(markup.match(/data-slug="foo"/));
    });

  });

  describe('async router', function() {
    var App = React.createClass({

      render: function() {
        return Locations({className: 'App', path: this.props.path},
          Location({
            path: '/',
            handler: function(props) { return React.DOM.div(null, 'mainpage') }
          })
        );
      }
    });

    it('renders to /', function() {
      var markup = React.renderToString(App({path: '/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/mainpage/));
    });
  });

});
