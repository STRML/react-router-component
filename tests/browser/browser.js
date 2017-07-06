'use strict';
var assert          = require('assert');
var assign          = Object.assign || require('object-assign');
var React           = require('react');
var ReactDOM        = require('react-dom');
var CreateReactClass = require('create-react-class');
var ReactTestUtils  = require('react-dom/test-utils');
var Router          = require('../../index');
var CaptureClicks   = React.createFactory(require('../../lib/CaptureClicks'));
var Location        = React.createFactory(Router.Location);
var Locations       = React.createFactory(Router.Locations);
var NotFound        = React.createFactory(Router.NotFound);
var Link            = React.createFactory(Router.Link);

var historyAPI = (
    window.history !== undefined &&
    window.history.pushState !== undefined
);

var host, app, router;

var timeout = 250;

var div = React.createFactory('div');
var a = React.createFactory('a');

function divProps(children, prop) {
  return CreateReactClass({
    render: function() {
      var propVal = this.props[prop];
      if (typeof propVal === 'object') propVal = JSON.stringify(propVal);
      return div(children, propVal);
    }
  });
}

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

function clickOn(component) {
  ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(component), {button: 0});
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
  }
}

describe('Routing', function() {

  if (!historyAPI) return;

  var App = CreateReactClass({

    getInitialState: function() {
      return {};
    },

    render: function() {
      return div({onClick: this.state.onClick},
        Locations({
            ref: 'router', className: 'App',
            onNavigation: this.state.navigationHandler,
            onBeforeNavigation: this.state.beforeNavigationHandler
          },
          Location({
            path: '/__zuul',
            foo: 'bar',
            ref: 'link',
            // To reach through a Location boundary, you must put a ref
            // on the Location itself, and the handler. We used to be able to just clone
            // the handler with the ref, but React now throws warnings on that use.
            handler: CreateReactClass({
              render: function() {
                return Link({
                  ref: 'inner',
                  foo: this.props.foo,
                  href: '/__zuul/hello'
                }, 'mainpage')
              }
            })
          }),
          Location({
            path: '/__zuul/transient',
            handler: div(null, 'i\'m transient')
          }),
          Location({
            path: '/__zuul/query',
            handler: divProps(null, '_query')
          }),
          Location({
            path: '/__zuul/:slug',
            handler: divProps(null, 'slug')
          }),
          NotFound({
            handler: div(null, 'not_found')
          })
        ),
        CaptureClicks({gotoURL: this.gotoURL},
          a({ref: 'anchor', href: '/__zuul/hi'}),
          a({ref: 'anchorUnhandled', href: '/goodbye'}),
          a({ref: 'anchorQuery', href: '/query-it?foo=bar'}),
          a({ref: 'anchorHash', href: '/hash-it#foo=bar'}),
          a({ref: 'anchorExternal', href: 'https://github.com/andreypopp/react-router-component'}),
          a({ref: 'anchorPrevented', href: '#'})
        ),
        Link({ref: 'outside', href: '/__zuul/hi'}),
        Link({ref: 'prevented', href: '/__zuul/hi', onClick: this.handlePreventedLinkClick}),
        Link({ref: 'externalHttp', href: 'http://github.com/andreypopp/react-router-component'}),
        Link({ref: 'externalHttps', href: 'https://github.com/andreypopp/react-router-component'}),
        Link({ref: 'externalOtherScheme', href: 'foo:bar'}),
        Link({ref: 'externalSchemeRelative', href: '//github.com/andreypopp/react-router-component'})
      );
    },

    gotoURL: function(url) {
      if (this.state.gotoURL) {
        this.state.gotoURL(url);
      }
    },

    handlePreventedLinkClick: function (event) {
      event.preventDefault();
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  describe('basic rendering', function() {
    it('renders', function() {
      assertRendered('mainpage');
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

    it('navigates to a different route (w/o callback)', function(done) {
      assertRendered('mainpage');
      router.navigate('/__zuul/hello');
      delay(function() {
        assertRendered('hello');
        done();
      });
    });

    it('navigates with a querystring and parses it', function(done) {
      assertRendered('mainpage');
      router.navigate('/__zuul/query?foo=bar&baz=biff&num=1');
      delay(function() {
        assertRendered(JSON.stringify({foo: 'bar', baz: 'biff', num: "1"}));
        done();
      });
    });

    it('handles "popstate" event', function(done) {
      assertRendered('mainpage');
      router.navigate('/__zuul/hello', function() {
        assertRendered('hello');
        window.history.back();
        delay(function() {
          assertRendered('mainpage');
          done();
        });
      });
    });

    it('navigates to a different route (replacing current history record)', function(done) {
      assertRendered('mainpage');
      router.navigate('/__zuul/hello', function() {
        assertRendered('hello');
        router.navigate('/__zuul/transient', {replace: true}, function() {
          assertRendered("i'm transient");
          window.history.back();
          delay(function() {
            assertRendered('mainpage');
            done();
          });
        });
      });
    });

    it('renders to NotFound if not match is found', function(done) {
      assertRendered('mainpage');
      router.navigate('/wow', function() {
        assertRendered('not_found');
        done();
      });
    });
  });

  describe('Navigation lifecycle callbacks', function () {
    it('calls onBeforeNavigation and onNavigation', function(done) {
      assertRendered('mainpage');
      var called = [];
      app.setState({
        beforeNavigationHandler: function (nextPath, navigation, match) {
          called.push(nextPath);
          assert.equal(match.match.slug, 'hello');
          assert(!navigation.match);
        },
        navigationHandler: function (path, navigation, match) {
          called.push(path);
          assert.equal(match.match.slug, 'hello');
          assert(!navigation.match);
        }
      });
      router.navigate('/__zuul/hello', function () {
        assert.equal(called.length, 2);
        assert.equal(called[0], '/__zuul/hello');
        assert.equal(called[1], '/__zuul/hello');
        done();
      });
    });
  });

  describe('Link component', function() {

    it('navigates via .navigate(path) call', function(done) {
      assertRendered('mainpage');
      router.refs.link.refs.inner.navigate('/__zuul/hello', function() {
        assertRendered('hello');
        done();
      });
    });

    it('navigates via onClick event', function(done) {
      assertRendered('mainpage');
      clickOn(router.refs.link);
      delay(function() {
        assertRendered('hello');
        done();
      });
    });

    it('navigates even if it is situated outside of the router context', function(done) {
      assertRendered('mainpage');
      clickOn(app.refs.outside);
      delay(function() {
        assertRendered('hi');
        done();
      });
    });

    it("doesn't navigate if the default is prevented", function(done) {
      assertRendered('mainpage');
      clickOn(app.refs.prevented);
      delay(function() {
        assertRendered('mainpage');
        done();
      });
    });

    it("doesn't navigate if the default is prevented", function(done) {
      assertRendered('mainpage');
      clickOn(app.refs.prevented);
      delay(function() {
        assertRendered('mainpage');
        done();
      });
    });

    var assertNotNavigated = function(done) {
      assertRendered('mainpage');
      app.setState({
        onClick: function(event) {
          // Make sure that the event hasn't had its default prevented by the
          // CaptureClicks component.
          assert(!event.defaultPrevented);
          event.preventDefault();
          assertRendered('mainpage');
          done();
        }
      });
    };

    it("doesn't navigate if the href is an absolute http url", function(done) {
      assertNotNavigated(done);
      clickOn(app.refs.externalHttp);
    });

    it("doesn't navigate if the href is an absolute https url", function(done) {
      assertNotNavigated(done);
      clickOn(app.refs.externalHttps);
    });

    it("doesn't navigate if the href is a url using another scheme", function(done) {
      assertNotNavigated(done);
      clickOn(app.refs.externalOtherScheme);
    });

    it("doesn't navigate if the href is a scheme-relative url", function(done) {
      assertNotNavigated(done);
      clickOn(app.refs.externalSchemeRelative);
    });
  });

  describe('CaptureClicks component', function() {
    it('navigates via onClick event', function(done) {
      assertRendered('mainpage');
      clickOn(app.refs.anchor);
      delay(function() {
        assertRendered('hi');
        done();
      });
    });

    it("Passes on query strings", function(done) {
      assertRendered('mainpage');
      app.setState({
        gotoURL: function(url) {
          assert(url.indexOf('/query-it?foo=bar') !== -1);
          done();
        }
      });
      clickOn(app.refs.anchorQuery);
    });

    it("Passes on hash", function(done) {
      assertRendered('mainpage');
      app.setState({
        gotoURL: function(url) {
          assert(url.indexOf('/hash-it#foo=bar') !== -1);
          done();
        }
      });
      clickOn(app.refs.anchorHash);
    });

    it("doesn't navigate if the href has another host", function(done) {
      assertRendered('mainpage');
      app.setState({
        onClick: function(event) {
          // Make sure that the event hasn't had its default prevented by the
          // CaptureClicks component.
          assert(!event.defaultPrevented);
          event.preventDefault();
          assertRendered('mainpage');
          done();
        }
      });
      clickOn(app.refs.anchorExternal);
    });

    it('follows the link if the href has no matching route', function(done) {
      assertRendered('mainpage');
      app.setState({
        gotoURL: function(url) {
          done();
        }
      });
      clickOn(app.refs.anchorUnhandled);
    });

    it('doesn\'t route bare hash links', function(done) {
      assertRendered('mainpage');
      var called = false;
      app.setState({
        gotoURL: function(url) {
          called = true;
          done();
        }
      });
      clickOn(app.refs.anchorPrevented);
      assert(!called);
      done();
    });
  });

});

describe('Nested routers', function() {

  if (!historyAPI) return;

  var NestedRouter = CreateReactClass({
    render: function() {
      return div(null,
        Locations(this.props,
          Location({
            path: '/__zuul/nested/',
            handler: div(null, 'nested/root')
          }),
          Location({
            path: '/__zuul/nested/page',
            handler: div(null, 'nested/page')
          })
        ));
    }
  });

  var App = CreateReactClass({

    getInitialState: function() {
      return {};
    },

    render: function() {
      return div(null,
        Locations({
          ref: 'router', className: 'App',
          onNavigation: this.state.navigationHandler,
          onBeforeNavigation: this.state.beforeNavigationHandler
        },
          Location({
            path: '/__zuul',
            foo: 'bar',
            ref: 'link',
            handler: CreateReactClass({
              render: function() {
                return Link({foo: this.props.foo, href: '/__zuul/hello'}, 'mainpage')
              }
            })
          }),
          Location({
            path: '/__zuul/nested/*',
            handler: NestedRouter,
            onNavigation: this.state.navigationHandler,
            onBeforeNavigation: this.state.beforeNavigationHandler
          })
        ),
        CaptureClicks({gotoURL: this.gotoURL},
          a({ref: 'anchor', href: '/__zuul/nested/page'}),
          a({ref: 'anchorNestedRoot', href: '/__zuul/nested/'}),
          a({ref: 'anchorUnhandled', href: '/__zuul/nested/404'})
        )
      );
    },

    gotoURL: function(url) {
      if (this.props.gotoURL) {
        this.props.gotoURL(url);
      }
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

  it('calls onBeforeNavigation and onNavigation with correct match objects w/ multiple routers', function(done) {
    assertRendered('mainpage');
    var called = [];
    router.navigate('/__zuul/nested/');
    // Goes beforeNav, beforeNav, nav, nav
    app.setState({
      beforeNavigationHandler: function (nextPath, navigation, match) {
        called.push(nextPath);
        if (called.length === 1) {
          assert.equal(match.match._[0], 'page');
          assert.equal(match.matchedPath, '/__zuul/nested/');
        } else {
          assert.equal(match.matchedPath, '/__zuul/nested/page');
        }
        assert(!navigation.match);
      },
      navigationHandler: function (path, navigation, match) {
        called.push(path);
        if (called.length === 3) {
          assert.equal(match.match._[0], 'page');
          assert.equal(match.matchedPath, '/__zuul/nested/');
        } else {
          assert.equal(match.matchedPath, '/__zuul/nested/page');
        }
        assert(!navigation.match);
      }
    });
    router.navigate('/__zuul/nested/page', function () {
      assert.equal(called.length, 4);
      called.forEach(function(c) {
        assert.equal(c, '/__zuul/nested/page');
      });
      done();
    });
  });

  describe('CaptureClicks component', function() {
    it('navigates to a subroute via onClick event', function(done) {
      assertRendered('mainpage');
      app.setState({
        gotoURL: function(url) {
          done(new Error('Followed link to ' + url));
        }
      });
      clickOn(app.refs.anchor);
      delay(function() {
        assertRendered('nested/page');
        done();
      });
    });

    it('navigates to a subroute via onClick event (root case)', function(done) {
      assertRendered('mainpage');
      app.setState({
        gotoURL: function(url) {
          done(new Error('Followed link to ' + url));
        }
      });
      clickOn(app.refs.anchorNestedRoot);
      delay(function() {
        assertRendered('nested/root');
        done();
      });
    });

  });

});

describe('Contextual routers', function() {

  if (!historyAPI) return;

  var SubCat = CreateReactClass({

    render: function() {
      return div(null,
        Locations(assign({ref: 'router', contextual: true}, this.props),
          Location({
            path: '/',
            handler: div(null, 'subcat/root')
          }),
          Location({
            path: '/page',
            ref: 'link',
            handler: Link({href: '/'}, 'subcat/page')
          }),
          Location({
            path: '/escape',
            ref: 'link',
            handler: Link({global: true, href: '/__zuul'}, 'subcat/escape')
          })
        ));
    }
  });

  var App = CreateReactClass({

    getInitialState: function() {
      return {};
    },

    render: function() {
      return Locations({
        ref: 'router',
        onNavigation: this.state.navigationHandler,
        onBeforeNavigation: this.state.beforeNavigationHandler
      },
        Location({
          path: '/__zuul',
          handler: div(null, "mainpage")
        }),
        Location({
          path: '/__zuul/subcat/*',
          handler: SubCat,
          ref: 'subcat',
          onNavigation: this.state.navigationHandler,
          onBeforeNavigation: this.state.beforeNavigationHandler
        })
      );
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
      delay(function() {
        assertRendered('subcat/root');
        done();
      });
    });
  });

  it('does not scope global Link to a current context', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/subcat/escape', function() {
      assertRendered('subcat/escape');
      clickOn(router.refs.subcat.refs.router.refs.link);
      delay(function() {
        assertRendered('mainpage');
        done();
      });
    });
  });

  it('calls onBeforeNavigation and onNavigation with correct match objects w/ contextual routers', function(done) {
    assertRendered('mainpage');
    var called = [];
    router.navigate('/__zuul/subcat/');
    // Goes beforeNav, beforeNav, nav, nav
    app.setState({
      beforeNavigationHandler: function (nextPath, navigation, match) {
        called.push(nextPath);
        if (called.length === 1) {
          assert.equal(match.match._[0], 'page');
          assert.equal(match.matchedPath, '/__zuul/subcat/');
        } else {
          assert.equal(match.matchedPath, '/page');
        }
        assert(!navigation.match);
      },
      navigationHandler: function (path, navigation, match) {
        called.push(path);
        if (called.length === 3) {
          assert.equal(match.match._[0], 'page');
          assert.equal(match.matchedPath, '/__zuul/subcat/');
        } else {
          assert.equal(match.matchedPath, '/page');
        }
        assert(!navigation.match);
      }
    });
    router.navigate('/__zuul/subcat/page', function () {
      assert.equal(called.length, 4);
      done();
    });
  });

  it('Passes query to subrouter', function(done) {
    assertRendered('mainpage');
    var called = [];
    router.navigate('/__zuul/subcat/');
    app.setState({
      // Goes beforeNav, beforeNav, nav, nav
      navigationHandler: function(path, navigation, match) {
        called.push(path);
        if (called.length === 1) {
          // App
          assert.equal(match.match._[0], 'page');
        } else {
          // SubCat
          assert.equal(match.matchedPath, '/page');
        }
        assert.equal(match.query.foo, 'bar');
        assert.equal(match.query.baz, 'biff');
      }
    });
    router.navigate('/__zuul/subcat/page?foo=bar&baz=biff', function () {
      assert.equal(called.length, 2);
      done();
    });
  });
});

describe('Multiple active routers', function() {

  if (!historyAPI) return;

  var App = CreateReactClass({

    render: function() {
      var router1 = Locations({ref: 'router1', className: 'App'},
        Location({
          path: '/__zuul',
          ref: 'link',
          handler: Link({href: '/__zuul/hello'}, 'mainpage1')
        }),
        Location({
          path: '/__zuul/:slug',
          handler: CreateReactClass({
            render: function() {
              return div(null, this.props.slug + '1');
            }
          })
        })
      );

      var router2 = Locations({ref: 'router2', className: 'App'},
        Location({
          path: '/__zuul',
          ref: 'link',
          handler: Link({href: '/__zuul/hello'}, 'mainpage2')
        }),
        Location({
          path: '/__zuul/:slug',
          handler: CreateReactClass({
            render: function() {
              return div(null, this.props.slug + '2');
            }
          })
        })
      );
      return div({ref: 'content'}, router1, router2);
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders', function() {
    assertRendered('mainpage1mainpage2');
  });

  it('navigates to a different route', function(done) {
    assertRendered('mainpage1mainpage2');
    app.refs.router1.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      done();
    });
  });

  it('navigates to a different route (using another router)', function(done) {
    assertRendered('mainpage1mainpage2');
    app.refs.router2.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      done();
    });
  });

  it('handles "popstate" event', function(done) {
    assertRendered('mainpage1mainpage2');
    app.refs.router1.navigate('/__zuul/hello', function() {
      assertRendered('hello1hello2');
      window.history.back();
      delay(function() {
        assertRendered('mainpage1mainpage2');
        done();
      });
    });
  });

});

describe('Hash routing', function() {

  var App = CreateReactClass({

    render: function() {
      return Locations({ref: 'router', hash: true, className: 'App'},
        Location({
          path: '/',
          ref: 'link',
          handler: Link({href: '/hello'}, 'mainpage')
        }),
        Location({
          path: '/transient',
          handler: div(null, "i'm transient")
        }),
        Location({
          path: '/:slug',
          handler: CreateReactClass({
            render: function() {
              return div(null, this.props.slug);
            }
          })
        })
      );
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders', function() {
    assertRendered('mainpage');
    var dom = ReactDOM.findDOMNode(app);
    if (dom.classList)
      assert.ok(dom.classList.contains('App'));
  });

  it('navigates to a different route (replacing current history record)', function(done) {
    assertRendered('mainpage');
    router.navigate('/hello', function() {
      assertRendered('hello');
      delay(function() {
        router.navigate('/transient', {replace: true}, function() {
          assertRendered("i'm transient");
          window.history.back();
          delay(function() {
            assertRendered('mainpage');
            done();
          });
        });
      });
    });
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
      delay(function() {
        assertRendered('mainpage');
        done();
      });
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
      delay(function() {
        assertRendered('hello');
        done();
      });
    });
  });

});

describe('Contextual Hash routers', function() {

  var SubCat = CreateReactClass({

    render: function() {
      return div(null,
        Locations({ref: 'router', contextual: true},
          Location({
            path: '/',
            handler: div(null, 'subcat/root')
          }),
          Location({
            path: '/escape',
            ref: 'link',
            handler: Link({globalHash: true, href: '/'}, 'subcat/escape')
          })
        ));
    }
  });

  var App = CreateReactClass({

    render: function() {
      return Locations({ref: 'router', hash: true},
        Location({
          path: '/',
          handler: div(null, "mainpage")
        }),
        Location({
          path: '/subcat/*',
          handler: SubCat,
          ref: 'subcat'
        })
      );
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  describe('Link component', function() {

    it('does not scope globalHash Link to a current context', function(done) {
      assertRendered('mainpage');
      router.navigate('/subcat/escape', function() {
        assertRendered('subcat/escape');
        clickOn(router.refs.subcat.refs.router.refs.link);
        delay(function() {
          assertRendered('mainpage');
          done();
        });
      });
    });

  });
});
