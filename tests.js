var assert = require('assert');
var React  = require('react');
var Router = require('./index');

var historyAPI = window.history !== undefined && window.history.pushState !== undefined;

function getText(node) {
  return node.textContent || node.innerText;
}

describe('react-router-component', function() {

  if (!historyAPI) return;

  var NestedRouter = React.createClass({
    render: function() {
      return React.DOM.div(null,
        Router.Locations(null,
          Router.Location({path: '/__zuul/nested/'}, function(props) {
            return 'nested/root';
          }),
          Router.Location({path: '/__zuul/nested/page'}, function(props) {
            return 'nested/page';
          })
        ));
    }
  });

  var ContextualRouter = React.createClass({
    render: function() {
      return React.DOM.div(null,
        Router.Locations({contextual: true},
          Router.Location({path: '/'}, function(props) {
            return 'contextual/root';
          }),
          Router.Location({path: '/page'}, function(props) {
            return 'contextual/page';
          })
        ));
    }
  });

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router', className: 'App'},
        Router.Location({path: '/__zuul'}, function(props) {
          return Router.Link({ref: 'link', href: '/__zuul/hello'}, 'mainpage')
        }),
        Router.Location({path: '/__zuul/nested/*'}, function(props) {
          return NestedRouter();
        }),
        Router.Location({path: '/__zuul/contextual/*'}, function(props) {
          return ContextualRouter();
        }),
        Router.Location({path: '/__zuul/:slug'}, function(props) {
          return props.slug
        })
      );
    }
  });

  var host, app, router;

  beforeEach(function() {
    host = document.createElement('div');
    document.body.appendChild(host);
    app = React.renderComponent(App(), host);
    router = app.refs.router;
  });

  afterEach(function(done) {
    React.unmountComponentAtNode(host);
    document.body.removeChild(host);
    host = null;
    app = null;
    router = null
    window.history.pushState({}, '', '/__zuul');
    setTimeout(done, 100);
  });

  it('renders', function() {
    assert.equal(getText(host), 'mainpage');
    var dom = app.getDOMNode();
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
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

  describe('Nested routers', function() {

    it('navigates to a subroute', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.navigate('/__zuul/contextual/page', function() {
        assert.equal(getText(host), 'contextual/page');
        done();
      });
    });

    it('navigates to a subroute (root case)', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.navigate('/__zuul/contextual/', function() {
        assert.equal(getText(host), 'contextual/root');
        done();
      });
    });

  });

  describe('Contextual routers', function() {

    it('navigates to a subroute', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.navigate('/__zuul/contextual/page', function() {
        assert.equal(getText(host), 'contextual/page');
        done();
      });
    });

    it('navigates to a subroute (root case)', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.navigate('/__zuul/contextual/', function() {
        assert.equal(getText(host), 'contextual/root');
        done();
      });
    });

  });

  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.navigate('/__zuul/hello', function() {
        assert.equal(getText(host), 'hello');
        done();
      });
    });

    it('navigates via onClick event', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.onClick();
      setTimeout(function() {
        assert.equal(getText(host), 'hello');
        done();
      }, 200);
    });
  });
});

describe('react-router-component (hash routing)', function() {

  var App = React.createClass({

    render: function() {
      return Router.HashChange.Locations({ref: 'router', className: 'App'},
        Router.HashChange.Location({path: '/'}, function(props) {
          return Router.HashChange.Link({ref: 'link', href: '/hello'}, 'mainpage')
        }),
        Router.HashChange.Location({path: '/:slug'}, function(props) {
          return props.slug
        })
      );
    }
  });

  var host, app, router;

  beforeEach(function() {
    host = document.createElement('div');
    document.body.appendChild(host);
    app = React.renderComponent(App(), host);
    router = app.refs.router;
  });

  afterEach(function(done) {
    React.unmountComponentAtNode(host);
    document.body.removeChild(host);
    host = null;
    app = null;
    router = null
    window.location.hash = '';
    setTimeout(done, 200);
  });

  it('renders', function() {
    assert.equal(getText(host), 'mainpage');
    var dom = app.getDOMNode();
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
  });

  it('navigates to a different route', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/hello', function() {
      assert.equal(getText(host), 'hello');
      done();
    });
  });

  it('handles "haschange" event', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/hello', function() {
      assert.equal(getText(host), 'hello');
      window.location.hash = '/';
      setTimeout(function() {
        assert.equal(getText(host), 'mainpage');
        done();
      }, 200);
    });
  });
  
  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.navigate('/hello', function() {
        assert.equal(getText(host), 'hello');
        done();
      });
    });

    it('navigates via onClick event', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.refs.link.onClick();
      setTimeout(function() {
        assert.equal(getText(host), 'hello');
        done();
      }, 200);
    });
  });

});

