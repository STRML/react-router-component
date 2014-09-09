"use strict";

/* globals describe, it, beforeEach, afterEach */

var assert          = require('assert');
var ReactAsync      = require('react-async');
var React           = require('react');
var ReactTestUtils  = require('react/lib/ReactTestUtils');
var EventConstants  = require('react/lib/EventConstants');
var Router          = require('../index');
var CaptureClicks   = require('../lib/CaptureClicks');

var historyAPI = (
    window.history !== undefined &&
    window.history.pushState !== undefined
);

var host, app, router;

var timeout = 250;

var div = React.DOM.div;
var a = React.DOM.a;

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
  delay(done);
}

function setUp(App) {
  return function() {
    host = document.createElement('div');
    app = React.renderComponent(App(), host);
    router = app.refs.router;
  }
}

describe('Routing', function() {

  if (!historyAPI) return;

  var App = React.createClass({

    render: function() {
      return div({onClick: this.props.onClick},
        Router.Locations({
            ref: 'router', className: 'App',
            onNavigation: this.props.navigationHandler,
            onBeforeNavigation: this.props.beforeNavigationHandler
          },
          Router.Location({
            path: '/__zuul',
            foo: 'bar',
            ref: 'link',
            handler: function(props) {
              return Router.Link({
                foo: props.foo,
                href: '/__zuul/hello',
              }, 'mainpage')
            }
          }),
          Router.Location({
            path: '/__zuul/transient',
            handler: function(props) { return div(null, "i'm transient") }
          }),
          Router.Location({
            path: '/__zuul/:slug',
            handler: function(props) { return div(null, props.slug) }
          }),
          Router.NotFound({
            handler: function(props) { return div(null, 'not_found') }
          })
        ),
        CaptureClicks({gotoURL: this.gotoURL},
          a({ref: 'anchor', href: '/__zuul/hi'}),
          a({ref: 'anchorUnhandled', href: '/goodbye'}),
          a({ref: 'anchorExternal', href: 'https://github.com/andreypopp/react-router-component'})
        ),
        Router.Link({ref: 'outside', href: '/__zuul/hi'}),
        Router.Link({ref: 'prevented', href: '/__zuul/hi', onClick: this.handlePreventedLinkClick})
      );
    },

    gotoURL: function(url) {
      if (this.props.gotoURL) {
        this.props.gotoURL(url);
      }
    },

    handlePreventedLinkClick: function (event) {
      event.preventDefault();
    }
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

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

  it('handles "popstate" event', function(done) {
    assertRendered('mainpage');
    router.navigate('/__zuul/hello', function() {
      assertRendered('hello');
      history.back();
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
        history.back();
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

  describe('Navigation lifecycle callbacks', function () {
    it('calls onBeforeNaviation and onNavigation', function(done) {
      assertRendered('mainpage');
      var called = [];
      app.setProps({
        beforeNavigationHandler: function (nextPath) {
          called.push(nextPath);
        },
        navigationHandler: function () {
          called.push('onNavigation');
        }
      });
      router.navigate('/__zuul/hello', function () {
        assert.equal(called.length, 2);
        assert.equal(called[0], '/__zuul/hello');
        assert.equal(called[1], 'onNavigation');
        done();
      });
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

    it("doesn't navigate if the href has another host", function(done) {
      assertRendered('mainpage');
      app.setProps({
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
      app.setProps({
        gotoURL: function(url) {
          done();
        }
      });
      clickOn(app.refs.anchorUnhandled);
    });
  });

});

describe('Routing with async components', function() {

  if (!historyAPI) return;

  var mainWasInLoadingState;
  var aboutWasInLoadingState;
  var mainSeenPendingUpdate;

  var mainAsyncStateCount;
  var aboutAsyncStateCount;

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router', className: 'App'},
        Router.Location({path: '/__zuul', handler: Main, ref: 'main'}),
        Router.Location({path: '/__zuul/about', handler: About, ref: 'about'}),
        Router.Location({path: '/__zuul/about2', handler: About, ref: 'about2'})
      );
    }
  });

  var Main = React.createClass({
    mixins: [ReactAsync.Mixin, Router.NavigatableMixin],

    getInitialStateAsync: function(cb) {
      mainAsyncStateCount += 1;
      setTimeout(function() {
        cb(null, {message: 'main'});
      }, 20);
    },

    render: function() {
      if (!this.state.message) {
        mainWasInLoadingState = true;
      }

      if (this.context.router.hasPendingUpdate()) {
        mainSeenPendingUpdate = true;
      }
      return div(null, this.state.message ? this.state.message : 'loading...');
    }
  });

  var About = React.createClass({
    mixins: [ReactAsync.Mixin],

    getInitialStateAsync: function(cb) {
      aboutAsyncStateCount += 1;
      delay(function() {
        cb(null, {message: 'about'});
      });
    },

    render: function() {
      if (!this.state.message) {
        aboutWasInLoadingState = true;
      }
      return div(null, this.state.message ? this.state.message : 'loading...');
    }
  });

  beforeEach(function() {
    mainWasInLoadingState = false; 
    aboutWasInLoadingState = false;

    mainSeenPendingUpdate = false;

    mainAsyncStateCount = 0;
    aboutAsyncStateCount = 0;
  });

  beforeEach(setUp(App));
  afterEach(cleanUp);

  it('renders async component', function(done) {
    assertRendered('loading...');
    delay(50, function() {
      assertRendered('main');
      assert(!mainSeenPendingUpdate);
      assert(mainWasInLoadingState);
      assert.equal(mainAsyncStateCount, 1);
      assert.equal(aboutAsyncStateCount, 0);
      done();
    });
  });

  it('renders async component and navigates', function(done) {
    assertRendered('loading...');

    delay(100, function() {
      assertRendered('main');

      router.navigate('/__zuul/about', function(err) {
        if (err) return done(err);
        assertRendered('about');
        assert(mainWasInLoadingState);
        assert(mainSeenPendingUpdate);
        assert(!aboutWasInLoadingState);
        assert.equal(mainAsyncStateCount, 1);
        assert.equal(aboutAsyncStateCount, 1);
        done();
      });
    });
  });

  it('cancels pending update on navigate', function(done) {
    assertRendered('loading...');

    delay(100, function() {
      assertRendered('main');

      router.navigate('/__zuul/about', function(err) {
        if (err) return done(err);
        assert(false);
      });

      router.navigate('/__zuul', function(err) {
        if (err) return done(err);

        assertRendered('main');
        assert(mainSeenPendingUpdate);
        assert(mainWasInLoadingState);
        assert(!aboutWasInLoadingState);
        assert.equal(mainAsyncStateCount, 1);
        assert.equal(aboutAsyncStateCount, 1);
        done();
      });

    });
  });

  it('does not trigger async state load if type of the next component is the same', function(done) {
    assertRendered('loading...');

    delay(100, function() {
      assertRendered('main');

      router.navigate('/__zuul/about', function(err) {
        if (err) return done(err);
        assertRendered('about');

        router.navigate('/__zuul/about2', function(err) {
          if (err) return done(err);
          assertRendered('about');
          assert(mainWasInLoadingState);
          assert(mainSeenPendingUpdate);
          assert(!aboutWasInLoadingState);
          assert.equal(mainAsyncStateCount, 1);
          assert.equal(aboutAsyncStateCount, 1);
          done();
        });
      });
    });

  });
});

describe('Nested routers', function() {

  if (!historyAPI) return;

  var NestedRouter = React.createClass({
    render: function() {
      return div(null,
        Router.Locations(null,
          Router.Location({
            path: '/__zuul/nested/',
            handler: function(props) {
              return div(null, 'nested/root');
            }
          }),
          Router.Location({
            path: '/__zuul/nested/page',
            handler: function(props) {
              return div(null, 'nested/page');
            }
          })
        ));
    }
  });

  var App = React.createClass({

    render: function() {
      return div(null,
        Router.Locations({ref: 'router', className: 'App'},
          Router.Location({
            path: '/__zuul',
            foo: 'bar',
            ref: 'link',
            handler: function(props) {
              return Router.Link({foo: props.foo, href: '/__zuul/hello'}, 'mainpage')
            }
          }),
          Router.Location({
            path: '/__zuul/nested/*',
            handler: NestedRouter
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

  describe('CaptureClicks component', function() {
    it('navigates to a subroute via onClick event', function(done) {
      assertRendered('mainpage');
      app.setProps({
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
      app.setProps({
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

  var SubCat = React.createClass({

    render: function() {
      return div(null,
        Router.Locations({ref: 'router', contextual: true},
          Router.Location({
            path: '/',
            handler: function(props) { return div(null, 'subcat/root') }
          }),
          Router.Location({
            path: '/page',
            ref: 'link',
            handler: function(props) {
              return Router.Link({href: '/'}, 'subcat/page')
            }
          }),
          Router.Location({
            path: '/escape',
            ref: 'link',
            handler: function(props) {
              return Router.Link({global: true, href: '/__zuul'}, 'subcat/escape')
            }
          })
        ));
    }
  });

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router'},
        Router.Location({
          path: '/__zuul',
          handler: function() {
            return div(null, "mainpage")
          }
        }),
        Router.Location({
          path: '/__zuul/subcat/*',
          handler: SubCat,
          ref: 'subcat'
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
});

describe('Multiple active routers', function() {

  if (!historyAPI) return;

  var App = React.createClass({

    render: function() {
      var router1 = Router.Locations({ref: 'router1', className: 'App'},
        Router.Location({
          path: '/__zuul',
          ref: 'link',
          handler: function(props) {
            return Router.Link({href: '/__zuul/hello'}, 'mainpage1')
          }
        }),
        Router.Location({
          path: '/__zuul/:slug',
          handler: function(props) {
            return div(null, props.slug + '1');
          }
        })
      );

      var router2 = Router.Locations({ref: 'router2', className: 'App'},
        Router.Location({
          path: '/__zuul',
          ref: 'link',
          handler: function(props) {
            return Router.Link({href: '/__zuul/hello'}, 'mainpage2')
          }
        }),
        Router.Location({
          path: '/__zuul/:slug',
          handler: function(props) {
            return div(null, props.slug + '2');
          }
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

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router', hash: true, className: 'App'},
        Router.Location({
          path: '/',
          ref: 'link',
          handler: function(props) {
            return Router.Link({href: '/hello'}, 'mainpage');
          }
        }),
        Router.Location({
          path: '/transient',
          handler: function(props) {
            return div(null, "i'm transient");
          }
        }),
        Router.Location({
          path: '/:slug',
          handler: function(props) {
            return div(null, props.slug);
          }
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

  it('navigates to a different route (replacing current history record)', function(done) {
    assertRendered('mainpage');
    router.navigate('/hello', function() {
      assertRendered('hello');
      delay(function() {
        router.navigate('/transient', {replace: true}, function() {
          assertRendered("i'm transient");
          history.back();
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

  var SubCat = React.createClass({

    render: function() {
      return div(null,
        Router.Locations({ref: 'router', contextual: true},
          Router.Location({
            path: '/',
            handler: function(props) { return div(null, 'subcat/root') }
          }),
          Router.Location({
            path: '/escape',
            ref: 'link',
            handler: function(props) {
              return Router.Link({globalHash: true, href: '/'}, 'subcat/escape');
            }
          })
        ));
    }
  });

  var App = React.createClass({

    render: function() {
      return Router.Locations({ref: 'router', hash: true},
        Router.Location({
          path: '/',
          handler: function() {
            return div(null, "mainpage");
          }
        }),
        Router.Location({
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
