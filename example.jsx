var React     = require('react');
var Router    = require('./index');

var Locations = Router.Locations;
var Location  = Router.Location;
var NotFound  = Router.NotFound;

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
      <Locations location={this.props.location}>
        <Location path="/">
          <template>
            Main page
          </template>
        </Location>
        <Location path="/users/:username">
          <template>
            Hello, {props.username}
          </template>
        </Location>
        <NotFound>
          <template>
            404, sorry!
          </template>
        </NotFound>
      </Locations>
    );
  }
});

React.renderComponentToString(App({location: location}), function(markup) {
  console.log(markup);
});
