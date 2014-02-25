var assert = require('assert');
var React  = require('react');
var Router = require('../index');

describe('react-router-component (on server)', function() {

  var App = React.createClass({

    render: function() {
      return Router.Locations({className: 'App', path: this.props.path},
        Router.Location({path: '/', foo: 'bar'}, function(props) {
          return 'mainpage'
        }),
        Router.Location({path: '/x/:slug'}, function(props) {
          return props.slug
        }),
        Router.NotFound(null, function(props) {
          return 'not_found'
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

  describe('contextual router', function() {

    var App = React.createClass({

      render: function() {
        return Router.Locations({className: 'App', path: this.props.path},
          Router.Location({path: '/x/:slug/*'}, function(props) {
            return Router.Locations({className: 'X', contextual: true},
              Router.Location({path: '/hello'}, function(props) {
                return Router.Link({href: '/hi'});
              })
            )
          })
        );
      }
    });

    it ('render Link component with href scoped to its prefix', function() {
      var markup = React.renderComponentToString(App({path: '/x/nice/hello'}));
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="&#x2f;x&#x2f;nice&#x2f;hi"/));
    });

  });

});
