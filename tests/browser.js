var assert          = require('assert');
var React           = require('react');
var ReactTestUtils  = require('react/lib/ReactTestUtils');
var EventConstants  = require('react/lib/EventConstants');
var Router          = require('../index');

var historyAPI = (
    window.history !== undefined &&
    window.history.pushState !== undefined
);

var host, app, router, router1, router2;

function assertRendered(text) {
  var content = app.refs.content || app.refs.router;
  var node = content.getDOMNode();
  assert.equal(
    node.textContent || node.innerText,
    text
  );
}

function clickOn(component) {
  ReactTestUtils.simulateNativeEventOnDOMComponent(
    EventConstants.topLevelTypes.topClick,
    component,
    {});
}

function cleanUp(done) {
  React.unmountComponentAtNode(host);
  if (historyAPI) {
    window.history.pushState({}, '', '/__zuul');
  }
  window.location.hash = '';
  setTimeout(done, 200);
}

function setUp(App) {
  return function() {
    host = document.createElement('div');
    app = React.renderComponent(App(), host);
    router = app.refs.router;
    router1 = app.refs.router1;
    router2 = app.refs.router2;
  }
}

describe('Routing', function() {

  if (!historyAPI) return;

  var App = React.createClass({

    render: function() {
      return React.DOM.div(null,
        Router.Locations({ref: 'router', className: 'App'},
          Router.Location({path: '/__zuul', foo: 'bar'}, function(props) {
            return Router.Link({foo: props.foo, ref: 'link', href: '/__zuul/hello'}, 'mainpage')
          }),
          Router.Location({path: '/__zuul/:slug'}, function(props) {
            return props.slug
          }),
          Router.NotFound(null, function(props) {
            return 'not_found'
          })
        ),
        Router.Link({ref: 'outside', href: '/__zuul/hi'})
      );
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders', function() {
    assertRendered('mainpage');
    var dom = app.refs.router.getDOMNode();
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
  });

  it('passes props from location down to handler', function() {
    assertRendered('mainpage');
    assert.equal(router.refs.link.props.foo, 'bar');
  });

  it('navigates to a different route', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/hello', function() {
      assertRendered('hello');
      done();
    });
  });

  it('handles "popstate" event', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/hello', function() {
      assertRendered('hello');
      history.back();
      setTimeout(function() {
        assertRendered('mainpage');
        done();
      }, 200);
    });
  });

  it('renders to NotFound if not match is found', function(done) {
    assertRendered('mainpage');
    router.navigate('/wow', function() {
      assertRendered('not_found');
      done();
    });
  });

  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assertRendered('mainpage');
      router.refs.link.navigate('/__zuul/hello', function() {
        assertRendered('hello');
        done();
      });
    });

    it('navigates via onClick event', function(done) {
      assertRendered('mainpage');
      clickOn(router.refs.link);
      setTimeout(function() {
        assertRendered('hello');
        done();
      }, 200);
    });

    it('navigates even if it is situated outside of the router context', function(done) {
      assertRendered('mainpage');
      clickOn(app.refs.outside);
      setTimeout(function() {
        assertRendered('hi');
        done();
      }, 200);
    });

  });

});

describe('Nested routers', function() {

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
          })
        )
      );
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('navigates to a subroute', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/nested/page', function() {
      assertRendered('nested/page');
      done();
    });
  });

  it('navigates to a subroute (root case)', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/nested/', function() {
      assertRendered('nested/root');
      done();
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

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('navigates to a subroute', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/subcat/page', function() {
      assertRendered('subcat/page');
      done();
    });
  });

  it('navigates to a subroute (root case)', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/subcat/', function() {
      assertRendered('subcat/root');
      done();
    });
  });

  it('scopes router.navigate() to a current context', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/subcat/', function() {
      assertRendered('subcat/root');
      router.refs.subcat.refs.router.navigate('/page', function() {
        assertRendered('subcat/page');
        done();
      });
    });
  });

  it('scopes Link to a current context', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/subcat/page', function() {
      assertRendered('subcat/page');
      clickOn(router.refs.subcat.refs.router.refs.link);
      setTimeout(function() {
        assertRendered('subcat/root');
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
      return React.DOM.div({ref: 'content'}, router1, router2);
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders', function() {
    assertRendered('mainpage1mainpage2');
  });

  it('navigates to a different route', function(done) {
    assertRendered('mainpage1mainpage2');
    router1.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      done();
    });
  });

  it('navigates to a different route (using another router)', function(done) {
    assertRendered('mainpage1mainpage2');
    router2.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      done();
    });
  });

  it('handles "popstate" event', function(done) {
    assertRendered('mainpage1mainpage2');
    router1.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      window.history.back();
      setTimeout(function() {
        assertRendered('mainpage1mainpage2');
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

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders', function() {
    assertRendered('mainpage');
    var dom = app.getDOMNode();
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
  });

  it('navigates to a different route', function(done) {
    assertRendered('mainpage');
    router.navigate('/hello', function() {
      assertRendered('hello');
      done();
    });
  });

  it('handles "haschange" event', function(done) {
    assertRendered('mainpage');
    router.navigate('/hello', function() {
      assertRendered('hello');
      window.location.hash = '/';
      setTimeout(function() {
        assertRendered('mainpage');
        done();
      }, 200);
    });
  });

  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assertRendered('mainpage');
      router.refs.link.navigate('/hello', function() {
        assertRendered('hello');
        done();
      });
    });

    it('navigates via onClick event', function(done) {
      assertRendered('mainpage');
      clickOn(router.refs.link);
      setTimeout(function() {
        assertRendered('hello');
        done();
      }, 200);
    });
  });

});
