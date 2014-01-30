require('node-jsx').install();

var React = require('react');
var App = require('./index');

var location = {
  "origin": "https://github.com",
  "hash": "",
  "search": "",
  "pathname": "/users/Andrey",
  "port": "",
  "hostname": "github.com",
  "host": "github.com",
  "protocol": "https:",
  "href": "https://github.com/"
}

React.renderComponentToString(App({location: location}), function(markup) {
  console.log(markup);
});
