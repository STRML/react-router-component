'use strict';
var assert = require('assert');
var React  = require('react');
var Router = require('../index');

describe('react-router-component (on server)', function() {

  var App = React.createClass({

    render: function() {
      return Router.Locations({className: 'App', path: this.props.path},
        Router.Location({
          path: '/',
          handler: function(props) { return React.DOM.div(null, 'mainpage'); }
        }),
        Router.Location({
          path: '/x/:slug',
          handler: function(props) { return React.DOM.div(null, props.slug); }
        }),
        Router.Location({
          path: /\/y(.*)/,
          handler: function(props) { return React.DOM.div(null, props._[0]);}
        }),
        Router.Location({
          path: /\/z\/(.*)\/(.*)/,
          matchKeys: ['match1', 'match2'],
          handler: function(props) { return React.DOM.div(null, props.match1 + props.match2);}
        }),
        Router.NotFound({
          handler: function(props) { return React.DOM.div(null, 'not_found'); }
        })
      );
    }
  });

  it('renders to /', function() {
    var markup = React.renderComponentToString(App({path: '/'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/mainpage/));
  });

  it('renders to /:slug', function() {
    var markup = React.renderComponentToString(App({path: '/x/hello'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/hello/));
  });

  it('renders with regex', function() {
    var markup = React.renderComponentToString(App({path: '/y/ohhai'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/ohhai/));
  })

  it('renders with regex and matchKeys', function() {
    var markup = React.renderComponentToString(App({path: '/z/one/two'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/onetwo/));
  })

  it('renders to empty on notfound', function() {
    var markup = React.renderComponentToString(App({path: '/notfound'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/not_found/));
  });

  describe('pages router', function() {

    var App = React.createClass({

      render: function() {
        return Router.Pages({className: 'App', path: this.props.path},
          Router.Location({
            path: '/',
            handler: function(props) { return React.DOM.div(null, 'mainpage') }
          })
        );
      }
    });

    it('renders to <body>', function() {
      var markup = React.renderComponentToString(App({path: '/'}));
      assert(markup.match(/<body [^>]+><div [^>]+>mainpage<\/div><\/body>/));
    });

  });

  describe('contextual router', function() {

    var ContextualRouter = React.createClass({

      render: function() {
        return Router.Locations({className: 'X', contextual: true},
          Router.Location({
            path: '/hello',
            handler: function(props) {
              return Router.Link({href: '/hi'});
            }
          }),
          Router.Location({
            path: '/hello2',
            handler: function(props) {
              return Router.Link({global: true, href: '/hi'});
            }
           }),
           Router.Location({
            path: '/hello3/*',
            handler: function(props) {
              return Router.Locations({className: 'Y', contextual: true},
                Router.Location({
                  path: '/:subslug',
                  handler: function(props) {
                    return Router.Link({href: '/sup-' + props.subslug});
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
        return Router.Locations({className: 'App', path: this.props.path},
          Router.Location({
            path: '/x/:slug/*',
            handler: ContextualRouter
          })
        );
      }
    });

    it ('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderComponentToString(App({path: '/x/nice/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/x\/nice\/hi"/));
    });

    it ('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderComponentToString(App({path: '/x/nice/hello2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/hi"/));
    });

    it ('renders Link component with href scoped to its nested context prefix', function() {
      var markup = React.renderComponentToString(App({path: '/x/nice/hello3/welcome'}));
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
        return Router.Locations({className: 'L2', contextual: true},
          Router.Location({
            path: '/',
            handler: function(props) {
              return Router.Link({href: '/hello', 'data-slug': thisSlug});
            }
          }),
          Router.Location({
            path: '/:slug',
            handler: function(props) {
              return Router.Link({global: true, href: '/hi', 'data-slug': props.slug});
            }
          })
        )
      }
    });

    var Level1 = React.createClass({

      render: function() {
        var thisSlug = this.props.slug;
        return Router.Locations({className: 'L1', contextual: true},
          Router.Location({
            path: '/',
            handler: function(props) {
              return Router.Link({href: '/l2', 'data-slug': thisSlug});
            }
          }),
          Router.Location({
            path: '/:slug(/*)',
            handler: Level2
          })
        )
      }
    });

    var App = React.createClass({

      render: function() {
        return Router.Locations({className: 'App', path: this.props.path},
          Router.Location({
            path: '/l1/:slug(/*)',
            handler: Level1
          })
        );
      }
    });

    it ('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderComponentToString(App({path: '/l1/nice'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it ('renders Link component with href scoped to its prefix - trailing slash', function() {
      var markup = React.renderComponentToString(App({path: '/l1/nice/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it ('renders nested Link component with href scoped to its prefix', function() {
      var markup = React.renderComponentToString(App({path: '/l1/nice/l2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/l1\/nice\/l2\/hello"/));
      assert(markup.match(/data-slug="l2"/));
    });

    it ('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderComponentToString(App({path: '/l1/nice/l2/foo'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/hi"/));
      assert(markup.match(/data-slug="foo"/));
    });

  });

  describe('async router', function() {
    var App = React.createClass({

      render: function() {
        return Router.Locations({className: 'App', path: this.props.path},
          Router.Location({
            path: '/',
            handler: function(props) { return React.DOM.div(null, 'mainpage') }
          })
        );
      }
    });

    it('renders to /', function() {
      var markup = React.renderComponentToString(App({path: '/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/mainpage/));
    });
  });

});
