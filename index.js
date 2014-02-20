"use strict";

var React     = require('react');
var invariant = require('react/lib/invariant');
var pattern   = require('url-pattern');

function createRouter(component, environment) {

  if (window.history === undefined) {
    environment = HashChangeRouterEnvironment;
  }

  return React.createClass({
    mixins: [environment],

    propTypes: {
      path: React.PropTypes.string,
      contextual: React.PropTypes.bool
    },

    contextTypes: {
      router: React.PropTypes.component,
    },

    childContextTypes: {
      router: React.PropTypes.component
    },

    getChildContext: function() {
      return {
        router: this
      };
    },

    navigate: function(path, cb) {
      this.updatePath(path);
      this.setState({match: this.matchPath(path)}, cb);
    },

    getInitialState: function() {
      var path;

      if (this.props.contextual && this.context.router) {
        var match = this.context.router.getMatch();
        invariant(
          this.props.path || match.match._ && match.match._.length > 0,
          "contextual router has nothing to match on"
        );
        path = this.props.path || match.match._[0];
      } else {
        path = this.props.path || this.getPath();
      }

      if (path[0] !== '/') {
        path = '/' + path;
      }

      return {
        match: this.matchPath(path)
      };
    },

    getMatch: function() {
      return this.state.match;
    },

    matchPath: function(path) {
      var match, page, notFound;

      var children = this.props.children;

      if (!Array.isArray(children)) {
        children = [children];
      }

      for (var i = 0, len = children.length; i < len; i++) {
        var current = children[i];

        if (process.env.NODE_ENV !== "production") {
          invariant(
            current.handler !== undefined && current.path !== undefined,
            "Router should contain either Route or NotFound components " +
            "as children")
        }

        if (current.path) {
          current.pattern = current.pattern || pattern(current.path);
          if (!page) {
            match = current.pattern.match(path);
            if (match) {
              page = current;
            }
          }
        }
        if (!notFound && current.path === null) {
          notFound = current;
        }
      }

      return {
        path: path,
        pattern: page ? page.pattern : null,
        route: page ? page : notFound ? notFound : null,
        match: match,
        getChildren: getChildren
      };
    },

    render: function() {
      return this.transferPropsTo(component(null, this.state.match.getChildren()));
    }
  });
}

/**
 * Helper to get children from a matched route.
 */
function getChildren() {
  return this.route ? this.route.handler(this.match) : undefined;
}

/**
 * Router environment mixin for routers which handles History API.
 */
var HistoryAPIRouterEnvironment = {

  getPath: function() {
    return window.location.pathname;
  },

  updatePath: function(path) {
    window.history.pushState({}, '', path);
  },

  componentDidMount: function() {
    window.addEventListener('popstate', this.onPopState);
  },

  componentWillUnmount: function() {
    window.removeEventListener('popstate', this.onPopState);
  },

  onPopState: function(e) {
    var path = window.location.pathname;

    if (this.state.match.path !== path) {
      this.setState({match: this.matchPath(path)});
    }
  }
};

/**
 * Router environment mixin for routers which handles hashchange event.
 */
var HashChangeRouterEnvironment = {

  getPath: function() {
    return window.location.hash.slice(1);
  },

  updatePath: function(path) {
    window.location.hash = path;
  },

  componentDidMount: function() {
    window.addEventListener('hashchange', this.onHashChange);
  },

  componentWillUnmount: function() {
    window.removeEventListener('hashchange', this.onHashChange);
  },

  onHashChange: function() {
    var path = window.location.hash.slice(1);

    if (this.state.match.path !== path) {
      this.setState({match: this.matchPath(path)});
    }
  }
};

function Route(props, handler) {
  invariant(
    typeof props.handler === 'function' || typeof handler === 'function',
    "Route handler should be a template");
  return {path: props.path, handler: props.handler || handler};
}

function NotFound(props, handler) {
  invariant(
    typeof props.handler === 'function' || typeof handler === 'function',
    "NotFound handler should be a template");
  return {path: null, handler: props.handler || handler};
}

/**
 * A component which can navigate to a different route.
 */
var NavigatableMixin = {

  contextTypes: {
    router: React.PropTypes.component,
  },

  navigate: function(path, cb) {
    this.context.router.navigate(path, cb);
  }
};

/**
 * A basic navigatable component which renders into <a> DOM element and handles
 * onClick event by transitioning onto different route (defined by
 * this.props.href).
 */
var Link = React.createClass({
  mixins: [NavigatableMixin],

  propTypes: {
    href: React.PropTypes.string.isRequired
  },

  onClick: function(e) {
    this.navigate(this.props.href);
    if (this.props.onClick)
      this.props.onClick(e);
  },

  render: function() {
    return this.transferPropsTo(
      React.DOM.a({onClick: this.onClick}, this.props.children));
  }
});

module.exports = {

  Hash: {
    Pages: createRouter(React.DOM.body, HashChangeRouterEnvironment),
    Page: Route,

    Locations: createRouter(React.DOM.div, HashChangeRouterEnvironment),
    Location: Route,

    NotFound: NotFound,
    Link: Link
  },

  Pages: createRouter(React.DOM.body, HistoryAPIRouterEnvironment),
  Page: Route,

  Locations: createRouter(React.DOM.div, HistoryAPIRouterEnvironment),
  Location: Route,

  NotFound: NotFound,

  NavigatableMixin: NavigatableMixin,
  Link: Link
}
