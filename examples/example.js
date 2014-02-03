var React     = require('react');
var Router    = require('./index');

var path = process.argv[2] || '/';

var App = React.createClass({
  render: function() {
    return Router.Locations({path: this.props.path},
      Router.Location({path: '/'}, function(state, props) {
        return ['Main page']
      }),
      Router.Location({path: '/users/:username'}, function(state, props) {
        return ['Hello, ', props.username];
      }),
      Router.NotFound(null, function(state, props) {
        return ['404, sorry!'];
      })
    );
  }
});

React.renderComponentToString(App({path: path}), function(markup) {
  console.log(markup);
});
