var React     = require('react');
var Router    = require('./index');

var path = process.argv[2] || '/';

var App = React.createClass({
  render: function() {
    return (
      <Router:Locations path={this.props.path}>
        <Router:Location path="/">
          <template>
            Main page at {state.path}
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

React.renderComponentToString(App({path: path}), function(markup) {
  console.log(markup);
});
