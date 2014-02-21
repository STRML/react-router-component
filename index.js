"use strict";

var pattern     = require('url-pattern');
var React       = require('react');
var merge       = require('react/lib/merge');
var invariant   = require('react/lib/invariant');
var Environment = require('./Environment');

var pathnameRoutingEnvironment = Environment.createEnvironment(
      Environment.PathnameRoutingMethod);

var hashRoutingEnvironment = Environment.createEnvironment(
      Environment.HashRoutingMethod);

function createRouter(component, environment) {

  if (!environment) {
    environment = (window.history === undefined) ?
      hashRoutingEnvironment :
      pathnameRoutingEnvironment;
  }

  return React.createClass({

    displayName: 'Router',

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

    getInitialState: function() {
      var path;
      var prefix;
      var fullPath = environment.getPath();

      if (this.props.contextual && this.context.router) {

        var match = this.context.router.getMatch();

        invariant(
          this.props.path || match.match._ && match.match._.length > 0,
          "contextual router has nothing to match on"
        );

        path = this.props.path || match.match._[0];
        prefix = fullPath.substring(0, fullPath.length - path.length);
      } else {

        path = this.props.path || fullPath;
        prefix = '';
      }

      if (path[0] !== '/') {
        path = '/' + path;
      }

      return {
        match: this.match(path),
        prefix: prefix
      };
    },

    componentWillReceiveProps: function() {
      this.setState(this.getInitialState());
    },

    getMatch: function() {
      return this.state.match;
    },

    /**
     * Return a match for the specified path
     *
     * @private
     *
     * @param {String} path
     */
    match: function(path) {
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

    navigate: function(path, cb) {
      path = join(this.state.prefix, path);
      environment.setPath(path, cb);
    },

    setPath: function(path, cb) {
      this.setState({match: this.match(path)}, cb);
    },

    getParentRouter: function() {
      return this.context.router;
    },

    componentDidMount: function() {
      environment.register(this);
    },

    componentWillUnmount: function() {
      environment.unregister(this);
    },

    render: function() {
      return this.transferPropsTo(component(null, this.state.match.getChildren()));
    }
  });
}

/**
 * Join pathnames and normalize double slashes.
 */
function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

/**
 * Helper to get children from a matched route.
 */
function getChildren() {
  return this.route ?
    this.route.handler(merge(this.match, {ref: this.route.ref})) :
    undefined;
}

function Route(props, handler) {
  invariant(
    typeof props.handler === 'function' || typeof handler === 'function',
    "Route handler should be a template");
  return {path: props.path, handler: props.handler || handler, ref: props.ref};
}

function NotFound(props, handler) {
  invariant(
    typeof props.handler === 'function' || typeof handler === 'function',
    "NotFound handler should be a template");
  return {path: null, handler: props.handler || handler, ref: props.ref};
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
    Pages: createRouter(React.DOM.body, hashRoutingEnvironment),
    Page: Route,

    Locations: createRouter(React.DOM.div, hashRoutingEnvironment),
    Location: Route,

    NotFound: NotFound,
    Link: Link
  },

  Pages: createRouter(React.DOM.body),
  Page: Route,

  Locations: createRouter(React.DOM.div),
  Location: Route,

  NotFound: NotFound,

  NavigatableMixin: NavigatableMixin,
  Link: Link
}
