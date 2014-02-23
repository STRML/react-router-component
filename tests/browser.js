var assert          = require('assert');
var React           = require('react');
var ReactTestUtils  = require('react/lib/ReactTestUtils');
var EventConstants  = require('react/lib/EventConstants');
var Router          = require('../index');

var historyAPI = window.history !== undefined && window.history.pushState !== undefined;

function getText(node) {
  return node.textContent || node.innerText;
}

function clickOn(component) {
  ReactTestUtils.simulateNativeEventOnDOMComponent(
    EventConstants.topLevelTypes.topClick,
    component,
    {});
}

describe('Routing', function() {

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

  var App = React.createClass({

    render: function() {
      return React.DOM.div(null,
        Router.Locations({ref: 'router', className: 'App'},
          Router.Location({path: '/__zuul', foo: 'bar'}, function(props) {
            return Router.Link({foo: props.foo, ref: 'link', href: '/__zuul/hello'}, 'mainpage')
          }),
          Router.Location({path: '/__zuul/nested/*'}, function(props) {
            return NestedRouter();
          }),
          Router.Location({path: '/__zuul/:slug'}, function(props) {
            return props.slug
          })
        ),
        Router.Link({ref: 'outside', href: '/__zuul/hi'})
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
    setTimeout(done, 200);
  });

  it('renders', function() {
    assert.equal(getText(host), 'mainpage');
    var dom = app.refs.router.getDOMNode();
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
  });

  it('passes props from location down to handler', function() {
    assert.equal(getText(host), 'mainpage');
    assert.equal(router.refs.link.props.foo, 'bar');
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
      router.navigate('/__zuul/nested/page', function() {
        assert.equal(getText(host), 'nested/page');
        done();
      });
    });

    it('navigates to a subroute (root case)', function(done) {
      assert.equal(getText(host), 'mainpage');
      router.navigate('/__zuul/nested/', function() {
        assert.equal(getText(host), 'nested/root');
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
      clickOn(router.refs.link);
      setTimeout(function() {
        assert.equal(getText(host), 'hello');
        done();
      }, 200);
    });

    it('navigates even if it is situated outside of the router context', function(done) {
      assert.equal(getText(host), 'mainpage');
      clickOn(app.refs.outside);
      setTimeout(function() {
        assert.equal(getText(host), 'hi');
        done();
      }, 200);
    });

  });

});

describe('Contextual routers', function() {

  if (!historyAPI) return;

  var SubCat = React.createClass({

    render: function() {
      return React.DOM.div(null,
        Router.Locations({ref: 'router', contextual: true},
          Router.Location({path: '/'}, function(props) {
            return 'subcat/root';
          }),
          Router.Location({path: '/page'}, function(props) {
            return Router.Link({ref: 'link', href: '/'}, 'subcat/page');
          })
        ));
    }
  });

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router'},
        Router.Location({path: '/__zuul', handler: function() { return "mainpage" }}),
        Router.Location({path: '/__zuul/subcat/*', handler: SubCat, ref: 'subcat'}));
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
    router = null;
    window.history.pushState({}, '', '/__zuul');
    setTimeout(done, 200);
  });

  it('navigates to a subroute', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/subcat/page', function() {
      assert.equal(getText(host), 'subcat/page');
      done();
    });
  });

  it('navigates to a subroute (root case)', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/subcat/', function() {
      assert.equal(getText(host), 'subcat/root');
      done();
    });
  });

  it('scopes router.navigate() to a current context', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/subcat/', function() {
      assert.equal(getText(host), 'subcat/root');
      router.refs.subcat.refs.router.navigate('/page', function() {
        assert.equal(getText(host), 'subcat/page');
        done();
      });
    });
  });

  it('scopes Link to a current context', function(done) {
    assert.equal(getText(host), 'mainpage');
    router.navigate('/__zuul/subcat/page', function() {
      assert.equal(getText(host), 'subcat/page');
      clickOn(router.refs.subcat.refs.router.refs.link);
      setTimeout(function() {
        assert.equal(getText(host), 'subcat/root');
        done();
      }, 200);
    });
  });
});

describe('Multiple active routers', function() {

  if (!historyAPI) return;

  var App = React.createClass({

    render: function() {
      var router1 = Router.Locations({ref: 'router1', className: 'App'},
        Router.Location({path: '/__zuul'}, function(props) {
          return Router.Link({ref: 'link', href: '/__zuul/hello'}, 'mainpage1')
        }),
        Router.Location({path: '/__zuul/:slug'}, function(props) {
          return props.slug + '1';
        })
      );
      var router2 = Router.Locations({ref: 'router2', className: 'App'},
        Router.Location({path: '/__zuul'}, function(props) {
          return Router.Link({ref: 'link', href: '/__zuul/hello'}, 'mainpage2')
        }),
        Router.Location({path: '/__zuul/:slug'}, function(props) {
          return props.slug + '2';
        })
      );
      return React.DOM.div(null, router1, router2);
    }
  });

  var host, app, router1, router2;

  beforeEach(function() {
    host = document.createElement('div');
    document.body.appendChild(host);
    app = React.renderComponent(App(), host);
    router1 = app.refs.router1;
    router2 = app.refs.router2;
  });

  afterEach(function(done) {
    React.unmountComponentAtNode(host);
    document.body.removeChild(host);
    host = null;
    app = null;
    router1 = null;
    router2 = null;
    window.history.pushState({}, '', '/__zuul');
    setTimeout(done, 200);
  });

  it('renders', function() {
    assert.equal(getText(host), 'mainpage1mainpage2');
  });

  it('navigates to a different route', function(done) {
    assert.equal(getText(host), 'mainpage1mainpage2');
    router1.navigate('/__zuul/hello', function() {
      assert.equal(getText(host), 'hello1hello2');
      done();
    });
  });

  it('navigates to a different route (using another router)', function(done) {
    assert.equal(getText(host), 'mainpage1mainpage2');
    router2.navigate('/__zuul/hello', function() {
      assert.equal(getText(host), 'hello1hello2');
      done();
    });
  });

  it('handles "popstate" event', function(done) {
    assert.equal(getText(host), 'mainpage1mainpage2');
    router1.navigate('/__zuul/hello', function() {
      assert.equal(getText(host), 'hello1hello2');
      window.history.back();
      setTimeout(function() {
        assert.equal(getText(host), 'mainpage1mainpage2');
        done();
      }, 200);
    });
  });

});

describe('Hash routing', function() {

  var App = React.createClass({

    render: function() {
      return Router.Hash.Locations({ref: 'router', className: 'App'},
        Router.Hash.Location({path: '/'}, function(props) {
          return Router.Hash.Link({ref: 'link', href: '/hello'}, 'mainpage')
        }),
        Router.Hash.Location({path: '/:slug'}, function(props) {
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
      clickOn(router.refs.link);
      setTimeout(function() {
        assert.equal(getText(host), 'hello');
        done();
      }, 200);
    });
  });

});
