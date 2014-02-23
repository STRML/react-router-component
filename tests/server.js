var assert = require('assert');
var React  = require('react');
var Router = require('../index');

describe('react-router-component (on server)', function() {

  var App = React.createClass({

    render: function() {
      return React.DOM.div(null,
        Router.Locations({className: 'App', path: this.props.path},
          Router.Location({path: '/', foo: 'bar'}, function(props) {
            return 'mainpage'
          }),
          Router.Location({path: '/x/:slug'}, function(props) {
            return props.slug
          }),
          Router.NotFound(null, function(props) {
            return 'not_found'
          })
        )
      );
    }
  });

  it('render to /', function() {
    var markup = React.renderComponentToString(App({path: '/'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/mainpage/));
  });

  it('render to /:slug', function() {
    var markup = React.renderComponentToString(App({path: '/x/hello'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/hello/));
  });

  it('render to empty on notfound', function() {
    var markup = React.renderComponentToString(App({path: '/notfound'}));
    assert(markup.match(/class="App"/));
    assert(markup.match(/not_found/));
  });
});
