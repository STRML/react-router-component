var assert = require('assert');
var React  = require('react');
var Router = require('./index');

var App = React.createClass({

  render: function() {
    return Router.Locations({ref: 'router', className: 'App'},
      Router.Location({path: '/__zuul'}, function(props) {
        return Router.Link({ref: 'link', href: '/__zuul/hello'}, 'mainpage')
      }),
      Router.Location({path: '/__zuul/:slug'}, function(props) {
        return props.slug
      })
    );
  }
});

function getText(node) {
  return node.textContent || node.innerText;
}

describe('react-router-component', function() {

  var host, app, router;

  beforeEach(function() {
    host = document.createElement('div');
    document.body.appendChild(host);
    app = React.renderComponent(App(), host);
    router = app.refs.router;
  });

  afterEach(function() {
    React.unmountComponentAtNode(host);
    document.body.removeChild(host);
    host = null;
    app = null;
    router = null
  });

  it('renders', function() {
    assert.equal(getText(host), 'mainpage');
    assert.ok(app.getDOMNode().classList.contains('App'));
  });

  it('navigates to a different route', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/hello', function() {
      assert.equal(getText(host), 'hello');
      history.back();
      setTimeout(done, 200);
    });
  });

  it('handles "popstate" event', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/hello', function() {
      assert.equal(getText(host), 'hello');
      history.back();
      setTimeout(function() {
        assert.equal(getText(host), 'mainpage');
        done();
      }, 200);
    });
  });

  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.navigate('/__zuul/hello', function() {
        assert.equal(getText(host), 'hello');
        history.back();
        setTimeout(function() {
          assert.equal(getText(host), 'mainpage');
          done();
        }, 200);
      });
    });

    it('navigates via onClick event', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.onClick();
      setTimeout(function() {
        assert.equal(getText(host), 'hello');
        history.back();
        setTimeout(function() {
          assert.equal(getText(host), 'mainpage');
          done();
        }, 200);
      }, 200);
    });
  });
});
