var React     = require('react');
var Router    = require('./index');

var location = {
  "origin": "https://github.com",
  "hash": "",
  "search": "",
  "pathname": process.argv[1] || '/',
  "port": "",
  "hostname": "github.com",
  "host": "github.com",
  "protocol": "https:",
  "href": "https://github.com/"
}

var App = React.createClass({
  render: function() {
    return (
      <Router:Locations location={this.props.location}>
        <Router:Location path="/">
          <template>
            Main page
          </template>
        </Router:Location>
        <Router:Location path="/users/:username">
          <template>
            Hello, {props.username}
          </template>
        </Router:Location>
        <Router:NotFound>
          <template>
            404, sorry!
          </template>
        </Router:NotFound>
      </Router:Locations>
    );
  }
});

React.renderComponentToString(App({location: location}), function(markup) {
  console.log(markup);
});
