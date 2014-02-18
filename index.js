"use strict";

var React     = require('react');
var invariant = require('react/lib/invariant');
var pattern   = require('url-pattern');

function createRouter(component) {

  return React.createClass({

    childContextTypes: {
      router: React.PropTypes.component,
      route: React.PropTypes.array
    },

    getChildContext: function() {
      return {
        router: this
      };
    },

    navigate: function(path, cb) {
      window.history.pushState({}, '', path);
      var path = window.location.pathname;
      this.setState({match: this.getMatch(path)}, cb);
    },

    getInitialState: function() {
      var path = this.props.path || window.location.pathname;
      return {
        match: this.getMatch(path)
      };
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
        this.setState({match: this.getMatch(path)});
      }
    },

    getMatch: function(path) {
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

module.exports = {

  Pages: createRouter(React.DOM.body),
  Page: Route,

  Locations: createRouter(React.DOM.div),
  Location: Route,

  NotFound: NotFound,

  NavigatableMixin: NavigatableMixin,
  Link: Link
}
