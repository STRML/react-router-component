'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var CreateReactClass = require('create-react-class');
var Router = require('../../index');

var Locations = Router.Locations;
var Location = Router.Location;
var NotFound = Router.NotFound;
var Link = Router.Link;
var CaptureClicks = require('../../lib/CaptureClicks');

// ============================================================================
// PATHNAME ROUTING APP
// ============================================================================

var MainPage = CreateReactClass({
  render: function() {
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement('h1', null, 'mainpage'),
      React.createElement(Link, { href: '/hello', 'data-testid': 'link-hello' }, 'Go to Hello'),
      React.createElement('br'),
      React.createElement(Link, { href: '/user/john', 'data-testid': 'link-user' }, 'Go to User'),
      React.createElement('br'),
      React.createElement(Link, { href: '/query?foo=bar&baz=biff&num=1', 'data-testid': 'link-query' }, 'Query Page')
    );
  }
});

var SlugPage = CreateReactClass({
  render: function() {
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement('span', { 'data-testid': 'slug' }, this.props.slug)
    );
  }
});

var QueryPage = CreateReactClass({
  render: function() {
    var query = this.props._query || {};
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement('span', { 'data-testid': 'query' }, JSON.stringify(query))
    );
  }
});

var TransientPage = CreateReactClass({
  render: function() {
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement('span', null, "i'm transient")
    );
  }
});

var NotFoundPage = CreateReactClass({
  render: function() {
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement('span', null, 'not_found')
    );
  }
});

// App with CaptureClicks and external links for testing
var App = CreateReactClass({
  getInitialState: function() {
    return { navigationLog: [] };
  },

  handleBeforeNavigation: function(path, navigation, match) {
    var log = this.state.navigationLog.slice();
    log.push({ type: 'before', path: path, matchedPath: match ? match.matchedPath : null });
    this.setState({ navigationLog: log });
  },

  handleNavigation: function(path, navigation, match) {
    var log = this.state.navigationLog.slice();
    log.push({ type: 'after', path: path, matchedPath: match ? match.matchedPath : null });
    this.setState({ navigationLog: log });
  },

  handlePreventedClick: function(e) {
    e.preventDefault();
  },

  render: function() {
    return React.createElement('div', null,
      // Navigation log for testing callbacks
      React.createElement('div', { 'data-testid': 'nav-log', style: { display: 'none' } },
        JSON.stringify(this.state.navigationLog)
      ),
      // Main router
      React.createElement(CaptureClicks, null,
        React.createElement(Locations, {
          className: 'App',
          onBeforeNavigation: this.handleBeforeNavigation,
          onNavigation: this.handleNavigation
        },
          React.createElement(Location, { path: '/', handler: MainPage }),
          React.createElement(Location, { path: '/transient', handler: TransientPage }),
          React.createElement(Location, { path: '/query', handler: QueryPage }),
          React.createElement(Location, { path: '/:slug', handler: SlugPage }),
          React.createElement(NotFound, { handler: NotFoundPage })
        )
      ),
      // Links outside router for testing
      React.createElement(Link, { 'data-testid': 'outside-link', href: '/outside-test' }, 'Outside Link'),
      React.createElement(Link, { 'data-testid': 'prevented-link', href: '/prevented', onClick: this.handlePreventedClick }, 'Prevented Link'),
      // External links
      React.createElement(Link, { 'data-testid': 'external-http', href: 'http://example.com' }, 'HTTP'),
      React.createElement(Link, { 'data-testid': 'external-https', href: 'https://example.com' }, 'HTTPS'),
      React.createElement(Link, { 'data-testid': 'external-scheme', href: 'mailto:test@example.com' }, 'Mailto'),
      React.createElement(Link, { 'data-testid': 'external-relative', href: '//example.com' }, 'Scheme Relative'),
      // Anchor elements for CaptureClicks testing
      React.createElement('a', { 'data-testid': 'anchor-internal', href: '/anchor-test' }, 'Anchor Internal'),
      React.createElement('a', { 'data-testid': 'anchor-external', href: 'https://github.com' }, 'Anchor External'),
      React.createElement('a', { 'data-testid': 'anchor-query', href: '/query-anchor?a=1&b=2' }, 'Anchor Query'),
      React.createElement('a', { 'data-testid': 'anchor-hash-bare', href: '#' }, 'Bare Hash'),
      React.createElement('a', { 'data-testid': 'anchor-unmatched', href: '/unmatched-route' }, 'Unmatched')
    );
  }
});

// ============================================================================
// NESTED ROUTERS APP
// ============================================================================

var NestedRouter = CreateReactClass({
  render: function() {
    return React.createElement(Locations, null,
      React.createElement(Location, { path: '/nested/', handler: React.createElement('div', { 'data-testid': 'content' },
        'nested/root',
        React.createElement(Link, { href: '/nested/page', 'data-testid': 'link-nested-page' }, 'Go to Page')
      )}),
      React.createElement(Location, { path: '/nested/page', handler: React.createElement('div', { 'data-testid': 'content' }, 'nested/page') })
    );
  }
});

var NestedApp = CreateReactClass({
  render: function() {
    return React.createElement(CaptureClicks, null,
      React.createElement(Locations, { className: 'App' },
        React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' },
          'mainpage',
          React.createElement(Link, { href: '/nested/', 'data-testid': 'link-nested' }, 'Go Nested')
        )}),
        React.createElement(Location, { path: '/nested/*', handler: NestedRouter })
      )
    );
  }
});

// ============================================================================
// CONTEXTUAL ROUTERS APP
// ============================================================================

var SubCat = CreateReactClass({
  render: function() {
    return React.createElement(Locations, { contextual: true },
      React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' },
        'subcat/root',
        React.createElement(Link, { href: '/page', 'data-testid': 'link-subpage' }, 'Go to Page')
      )}),
      React.createElement(Location, { path: '/page', handler: React.createElement('div', { 'data-testid': 'content' },
        'subcat/page',
        React.createElement(Link, { href: '/', 'data-testid': 'link-subroot' }, 'Back to Root')
      )}),
      React.createElement(Location, { path: '/escape', handler: React.createElement('div', { 'data-testid': 'content' },
        'subcat/escape',
        React.createElement(Link, { global: true, href: '/', 'data-testid': 'link-global' }, 'Global Home')
      )})
    );
  }
});

var ContextualApp = CreateReactClass({
  render: function() {
    return React.createElement(CaptureClicks, null,
      React.createElement(Locations, { className: 'App' },
        React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' },
          'mainpage',
          React.createElement(Link, { href: '/subcat/', 'data-testid': 'link-subcat' }, 'Go to Subcat'),
          React.createElement(Link, { href: '/subcat/escape', 'data-testid': 'link-subcat-escape' }, 'Go to Escape')
        )}),
        React.createElement(Location, { path: '/subcat/*', handler: SubCat })
      )
    );
  }
});

// ============================================================================
// MULTIPLE ROUTERS APP
// ============================================================================

var MultiRouterApp = CreateReactClass({
  render: function() {
    return React.createElement('div', { 'data-testid': 'content' },
      React.createElement(Locations, { className: 'Router1' },
        React.createElement(Location, { path: '/', handler: React.createElement('span', null, 'mainpage1') }),
        React.createElement(Location, { path: '/:slug', handler: CreateReactClass({
          render: function() { return React.createElement('span', null, this.props.slug + '1'); }
        })})
      ),
      React.createElement(Locations, { className: 'Router2' },
        React.createElement(Location, { path: '/', handler: React.createElement('span', null, 'mainpage2') }),
        React.createElement(Location, { path: '/:slug', handler: CreateReactClass({
          render: function() { return React.createElement('span', null, this.props.slug + '2'); }
        })})
      )
    );
  }
});

// ============================================================================
// HASH ROUTING APP
// ============================================================================

var HashApp = CreateReactClass({
  render: function() {
    return React.createElement(CaptureClicks, null,
      React.createElement(Locations, { className: 'App', hash: true },
        React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' },
          'mainpage',
          React.createElement(Link, { href: '/hello', 'data-testid': 'link-hello' }, 'Hello')
        )}),
        React.createElement(Location, { path: '/transient', handler: React.createElement('div', { 'data-testid': 'content' }, "i'm transient") }),
        React.createElement(Location, { path: '/:slug', handler: SlugPage })
      )
    );
  }
});

// ============================================================================
// CONTEXTUAL HASH ROUTING APP
// ============================================================================

var HashSubCat = CreateReactClass({
  render: function() {
    return React.createElement(Locations, { contextual: true },
      React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' }, 'subcat/root') }),
      React.createElement(Location, { path: '/escape', handler: React.createElement('div', { 'data-testid': 'content' },
        'subcat/escape',
        React.createElement(Link, { globalHash: true, href: '/', 'data-testid': 'link-global-hash' }, 'Global Hash Home')
      )})
    );
  }
});

var HashContextualApp = CreateReactClass({
  render: function() {
    return React.createElement(CaptureClicks, null,
      React.createElement(Locations, { className: 'App', hash: true },
        React.createElement(Location, { path: '/', handler: React.createElement('div', { 'data-testid': 'content' }, 'mainpage') }),
        React.createElement(Location, { path: '/subcat/*', handler: HashSubCat })
      )
    );
  }
});

// ============================================================================
// RENDER APPROPRIATE APP
// ============================================================================

var params = new URLSearchParams(window.location.search);
var mode = params.get('mode');

var AppToRender;
switch (mode) {
  case 'nested':
    AppToRender = NestedApp;
    break;
  case 'contextual':
    AppToRender = ContextualApp;
    break;
  case 'multi':
    AppToRender = MultiRouterApp;
    break;
  case 'hash':
    AppToRender = HashApp;
    break;
  case 'hash-contextual':
    AppToRender = HashContextualApp;
    break;
  default:
    AppToRender = App;
}

ReactDOM.render(React.createElement(AppToRender), document.getElementById('app'));
