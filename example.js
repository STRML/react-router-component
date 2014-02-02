var React     = require('react');
var Router    = require('./index');

var location = {
  "origin": "https://github.com",
  "hash": "",
  "search": "",
  "pathname": process.argv[2] || '/',
  "port": "",
  "hostname": "github.com",
  "host": "github.com",
  "protocol": "https:",
  "href": "https://github.com/"
}

var App = React.createClass({
  render: function() {
    return Router.Locations({location: this.props.location},
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

React.renderComponentToString(App({location: location}), function(markup) {
  console.log(markup);
});
