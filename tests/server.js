'use strict';
var assert    = require('assert');
var React     = require('react');
var ReactDOMServer = require('react-dom/server');
var Router    = require('../index');
var Locations = Router.Locations;
var Pages     = Router.Pages;
var Location  = Router.Location;
var NotFound  = Router.NotFound;

describe('react-router-component (on server)', function() {

  describe('basic rendering', function() {
    var App = React.createClass({
      render: function() {
        return React.createElement(Locations, {className: 'App', path: this.props.path},
          React.createElement(Location, {
            path: '/',
            // Note that `handler` can take an Element...
            handler: React.createElement('div', null, 'mainpage')
          }),
          React.createElement(Location, {
            path: '/x/:slug',
            // Or a component.
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props.slug);
              }
            })
          }),
          React.createElement(Location, {
            path: /\/y(.*)/,
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props._[0]);
              }
            })
          }),
          React.createElement(Location, {
            path: /\/z\/(.*)\/(.*)/,
            matchKeys: ['match1', 'match2'],
            handler: React.createClass({
              render: function() {
                return React.createElement('div', null, this.props.match1 + this.props.match2);
              }
            })
          }),
          React.createElement(NotFound, {
            handler: React.createElement('div', null, 'not_found')
          })
        );
      }
    });

    it('renders to /', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/mainpage/));
    });

    it('renders to /:slug', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/x/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/hello/));
    });


    it('renders with regex', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/y/ohhai'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/ohhai/));
    });

    it('renders with regex and matchKeys', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/z/one/two'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/onetwo/));
    });

    it('renders to empty on notfound', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/notfound'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/not_found/));
    });

  });

  describe('pages router', function() {

    var App = React.createClass({

      render: function() {
        return React.createElement(Pages, {className: 'App', path: this.props.path},
          React.createElement(Location, {
            path: '/',
            handler: React.createElement('div', null, 'mainpage')
          })
        );
      }
    });

    it('renders to <body>', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/'}));
      assert(markup.match(/<body [^>]+><div [^>]+>mainpage<\/div><\/body>/));
    });

  });

  describe('contextual router', function() {

    var ContextualRouter = React.createClass({

      render: function() {
        return React.createElement(Locations, {className: 'X', contextual: true},
          React.createElement(Location, {
            path: '/hello',
            handler: React.createElement(Router.Link, {href: '/hi'})
          }),
          React.createElement(Location, {
            path: '/hello2',
            handler: React.createElement(Router.Link, {global: true, href: '/hi'})
          }),
          React.createElement(Location, {
            path: '/hello3/*',
            handler:
              React.createElement(Locations, {className: 'Y', contextual: true},
                React.createElement(Location, {
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
        return React.createElement(Locations, {className: 'App', path: this.props.path},
          React.createElement(Location, {
            path: '/x/:slug/*',
            handler: ContextualRouter
          })
        );
      }
    });

    it('renders Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/x/nice/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/x\/nice\/hi"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/x/nice/hello2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/hi"/));
    });

    it('renders Link component with href scoped to its nested context prefix', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/x/nice/hello3/welcome'}));
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
        return React.createElement(Locations, {className: 'L2', contextual: true},
          React.createElement(Location, {
            path: '/',
            handler: React.createElement(Router.Link, {href: '/hello', 'data-slug': thisSlug})
          }),
          React.createElement(Location, {
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
        return React.createElement(Locations, {className: 'L1', contextual: true},
          React.createElement(Location, {
            path: '/',
            handler: React.createElement(Router.Link, {href: '/l2', 'data-slug': thisSlug})
          }),
          React.createElement(Location, {
            path: '/:slug(/*)',
            handler: Level2
          })
        )
      }
    });

    var App = React.createClass({
      render: function() {
        return React.createElement(Locations, {className: 'App', path: this.props.path},
          React.createElement(Location, {
            path: '/l1/:slug(/*)',
            handler: Level1
          })
        );
      }
    });

    it('renders Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/l1/nice'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders Link component with href scoped to its prefix - trailing slash', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/l1/nice/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders nested Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/l1/nice/l2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/l1\/nice\/l2\/hello"/));
      assert(markup.match(/data-slug="l2"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/l1/nice/l2/foo'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/hi"/));
      assert(markup.match(/data-slug="foo"/));
    });

  });

  describe('context passing', function() {
    var Inner = React.createClass({
      displayName: 'Inner',
      contextTypes: {
        flux: React.PropTypes.object
      },

      render: function() {
        assert(this.context.flux && this.context.flux.key);
        return React.createElement('div', {}, this.context.flux.key);
      }
    });

    var App = React.createClass({

      childContextTypes: {
        flux: React.PropTypes.object
      },

      getChildContext: function() {
        return {
          flux: {key: 'flux_value'}
        };
      },

      getRoutes: function() {
        return [
          React.createElement(Location, {
            path: '/',
            handler: Inner
          }),
          React.createElement(Location, {
            path: '/blargh',
            handler: React.createElement('div', null, 'wrong way')
          }),
          React.createElement(NotFound, {
            handler: React.createElement('div', null, 'not found')
          })
        ]
      },

      render: function() {
        var routes = this.getRoutes();

        return React.createElement('div', {className: 'App'},
          React.createElement('div', {},
            React.createElement(Locations, {path: this.props.path, children: routes})
          )
        );
      }
    });

    it('renders to / with context intact', function() {
      var markup = ReactDOMServer.renderToString(React.createElement(App, {path: '/'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/flux_value/));
    });
  });

});
