'use strict';
var assert          = require('power-assert');
var React           = require('react');
var ReactDOM        = React; // For 0.13
var Router          = require('../../index');

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
  var node = ReactDOM.findDOMNode(content);
  return node.textContent || node.innerText;
}

function assertRendered(text) {
  assert.equal(
    getRenderedContent(),
    text
  );
}

function cleanUp(done) {
  ReactDOM.unmountComponentAtNode(host);
  if (historyAPI) {
    window.history.pushState({}, '', '/__zuul');
  }
  window.location.hash = '';
  delay(done);
}

function setUp(App) {
  return function() {
    host = document.createElement('div');
    app = ReactDOM.render(React.createElement(App), host);
    router = app.refs.router;
  };
}
describe('JSX + Routing with async components', function() {

  if (!historyAPI) return;

  var Main = React.createClass({
    render: function() {
      return <div>Main</div>;
    }
  });

  var Page1 = React.createClass({
    render: function() {
      return <div>Page1</div>;
    }
  });

  var Page2 = React.createClass({
    render: function() {
      return <div>{this.props.text}</div>;
    }
  });

  var App = React.createClass({
    render: function() {
      var Locations = Router.Locations;
      var Location = Router.Location;
      return (
        <Locations ref='router' className='App'>
          <Location path='/__zuul' handler={Main} ref='main'/>
          <Location path='/__zuul/page1' handler={Page1} ref='page1'/>
          <Location path='/__zuul/:text' handler={Page2} ref='page2'/>
        </Locations>
      );
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
