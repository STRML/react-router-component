"use strict";
var React     = require('react');
var invariant = require('react/lib/invariant');
var pattern   = require('url-pattern');

function createRouter(component) {
  return React.createClass({

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

      for (i = 0, len = this.props.children.length; i < len; i++) {
        var current = this.props.children[i];

        if (process.env.NODE_ENV !== "production") {
          invariant(
            current.handler !== undefined && current.path !== undefined,
            "Router should contain either Route or NotFound components as children")
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

      var handler = page ? page.handler :
                     notFound ? notFound.handler :
                     [];

      return this.transferPropsTo(component(null, handler(match)));
    }
  });
}

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

  NotFound: NotFound
}
