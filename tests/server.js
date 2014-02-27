var assert = require('assert');
var React  = require('react');
var Router = require('../index');

describe('react-router-component (on server)', function() {

  var App = React.createClass({

    render: function() {
      return Router.Locations({className: 'App', path: this.props.path},
        Router.Location({
          path: '/',
          handler: function(props) { return 'mainpage' }
        }),
        Router.Location({
          path: '/x/:slug',
          handler: function(props) { return props.slug }
        }),
        Router.NotFound({
          handler: function(props) { return 'not_found' }
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
            handler: function(props) { return 'mainpage' }
          })
        );
      }
    });

    it('renders to <body>', function() {
      var markup = React.renderComponentToString(App({path: '/'}));
      assert(markup.match(/<body [^>]+>mainpage<\/body>/));
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
      assert(markup.match(/href="&#x2f;x&#x2f;nice&#x2f;hi"/));
    });

    it ('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = React.renderComponentToString(App({path: '/x/nice/hello2'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="&#x2f;hi"/));
    });

  });

  describe('async router', function() {
    var App = React.createClass({

      render: function() {
        return Router.Locations({className: 'App', path: this.props.path},
          Router.Location({
            path: '/',
            handler: function(props) { return 'mainpage' }
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
