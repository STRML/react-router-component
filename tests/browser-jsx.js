'use strict';
var assert          = require('assert');
var React           = require('react');
var Router          = require('../index');

var historyAPI = (
    window.history !== undefined &&
    window.history.pushState !== undefined
);

var host, app, router;

var timeout = 250;

function delay(ms, func) {
  if (func === undefined) {
    func = ms;
    ms = timeout;
  }
  setTimeout(func, ms);
}

function getRenderedContent() {
  var content = app.refs.content || app.refs.router;
  var node = content.getDOMNode();
  return node.textContent || node.innerText;
}

function assertRendered(text) {
  assert.equal(
    getRenderedContent(),
    text
  );
}

function cleanUp(done) {
  React.unmountComponentAtNode(host);
  if (historyAPI) {
    window.history.pushState({}, '', '/__zuul');
  }
  window.location.hash = '';
  delay(done);
}

function setUp(App) {
  return function() {
    host = document.createElement('div');
    app = React.render(React.createElement(App), host);
    router = app.refs.router;
  };
}
describe('JSX + Routing with async components', function() {

  if (!historyAPI) return;

  var App = React.createClass({displayName: "App",

    render: function() {
      var Locations = Router.Locations;
      var Location = Router.Location;
      return (
        React.createElement(Locations, {ref: "router", className: "App"}, 
          React.createElement(Location, {path: "/__zuul", handler: Main, ref: "main"}), 
          React.createElement(Location, {path: "/__zuul/page1", handler: Page1, ref: "page1"}), 
          React.createElement(Location, {path: "/__zuul/:text", handler: Page2, ref: "page2"})
        )
      );
    }
  });

  var Main = React.createClass({displayName: "Main",
    render: function() {
      return React.createElement("div", null, "Main");
    }
  });

  var Page1 = React.createClass({displayName: "Page1",
    render: function() {
      return React.createElement("div", null, "Page1");
    }
  });

  var Page2 = React.createClass({displayName: "Page2",
    render: function() {
      return React.createElement("div", null, this.props.text);
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('jsx: renders component', function() {
    assertRendered('Main');
  });

  it('jsx: renders another route', function(done) {
    router.navigate('/__zuul/page1', function(err) {
      if (err) return done(err);
      assertRendered('Page1');
      done();
    });
  });

  it('jsx: renders a route with params', function(done) {
    router.navigate('/__zuul/page2', function(err) {
      if (err) return done(err);
      assertRendered('page2');
      done();
    });
  });
});
