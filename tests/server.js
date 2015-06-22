'use strict';
var assert    = require('assert');
var React     = require('react');
var Router    = require('../index');
var Locations = React.createFactory(Router.Locations);
var Pages     = React.createFactory(Router.Pages);
var Location  = React.createFactory(Router.Location);
var NotFound  = React.createFactory(Router.NotFound);

describe('react-router-component (on server)', function() {

  describe('basic rendering', function() {
    var App = React.createClass({
      render: function() {
        return Locations({className: 'App', path: this.props.path},
          Location({
            path: '/',
            // Note that `handler` can take an Element...
            handler: React.createElement('div', null, 'mainpage')
          }),
          Location({
            path: '/x/:slug',
            // Or a component.
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props.slug);
              }
            })
          }),
          Location({
            path: /\/y(.*)/,
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props._[0]);
              }
            })
          }),
          Location({
            path: /\/z\/(.*)\/(.*)/,
            matchKeys: ['match1', 'match2'],
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props.match1 + this.props.match2);
              }
            })
          }),
          NotFound({
            handler: React.createElement('div', null, 'not_found')
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
    });

    it('renders with regex and matchKeys', function() {
      var markup = React.renderToString(App({path: '/z/one/two'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/onetwo/));
    });

    it('renders to empty on notfound', function() {
      var markup = React.renderToString(App({path: '/notfound'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/not_found/));
    });

  });

  describe('pages router', function() {

    var App = React.createClass({

      render: function() {
        return Pages({className: 'App', path: this.props.path},
          Location({
            path: '/',
            handler: React.createElement('div', null, 'mainpage')
          })
        );
      }
    });

    App = React.createFactory(App);

    it('renders to <body>', function() {
      var markup = React.renderToString(App({path: '/'}));
      assert(markup.match(/<body [^>]+><div [^>]+>mainpage<\/div><\/body>/));
    });

  });

  describe('contextual router', function() {

    var ContextualRouter = React.createClass({

      render: function() {
        return Locations({className: 'X', contextual: true},
          Location({
            path: '/hello',
            handler: React.createElement(Router.Link, {href: '/hi'})
          }),
          Location({
            path: '/hello2',
            handler: React.createElement(Router.Link, {global: true, href: '/hi'})
          }),
          Location({
            path: '/hello3/*',
            handler:
              Locations({className: 'Y', contextual: true},
                Location({
                  path: '/:subslug',
                  handler: React.createClass({
                    render: function() {
                      return React.createElement(Router.Link, {href: '/sup-' + this.props.subslug});
                    }
                  })
                })
              )
          })
        );
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

    it('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/x/nice/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/x\/nice\/hi"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderToString(App({path: '/x/nice/hello2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/hi"/));
    });

    it('renders Link component with href scoped to its nested context prefix', function() {
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
            handler: React.createElement(Router.Link, {href: '/hello', 'data-slug': thisSlug})
          }),
          Location({
            path: '/:slug',
            handler: React.createClass({
              render: function() {
                return React.createElement(Router.Link, {global: true, href: '/hi', 'data-slug': this.props.slug});
              }
            })
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
            handler: React.createElement(Router.Link, {href: '/l2', 'data-slug': thisSlug})
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

    App = React.createFactory(App);

    it('renders Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/l1/nice'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders Link component with href scoped to its prefix - trailing slash', function() {
      var markup = React.renderToString(App({path: '/l1/nice/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders nested Link component with href scoped to its prefix', function() {
      var markup = React.renderToString(App({path: '/l1/nice/l2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/l1\/nice\/l2\/hello"/));
      assert(markup.match(/data-slug="l2"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
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
            handler: React.createElement('div', null, 'mainpage')
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
  });

});
