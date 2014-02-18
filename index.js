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
      this.setState({path: window.location.pathname}, cb);
    },

    getInitialState: function() {
      return {
        path: this.props.path || window.location.pathname
      }
    },

    componentDidMount: function() {
      window.addEventListener('popstate', this.onPopState);
    },

    componentWillUnmount: function() {
      window.removeEventListener('popstate', this.onPopState);
    },

    onPopState: function(e) {
      var path = window.location.pathname;

      if (this.state.path !== path) {
        this.setState({path: path});
      }
    },

    render: function() {
      var match, page, notFound;
      var len, i;

      var children = this.props.children;

      if (!Array.isArray(children)) {
        children = [children];
      }

      for (i = 0, len = children.length; i < len; i++) {
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
            match = current.pattern.match(this.state.path);
            if (match) {
              page = current;
            }
          }
        }
        if (!notFound && current.path === null) {
          notFound = current;
        }
      }

      var rendered = page ? page.handler(match) :
                     notFound ? notFound.handler(match) :
                     [];

      return this.transferPropsTo(component(null, rendered));
    }
  });
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
