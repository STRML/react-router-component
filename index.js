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

      this.children = this.children || this.props.children;

      for (i = 0, len = this.children.length; i < len; i++) {
        var current = this.children[i];

        if (process.env.NODE_ENV !== "production") {
          invariant(
            current.children !== undefined && current.path !== undefined,
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

      var children = page ? page.children :
                     notFound ? notFound.children :
                     [];

      return this.transferPropsTo(component(null, children(match)));
    }
  });
}

function Route(props, children) {
  invariant(
    typeof children === 'function',
    "Route children should be a template");
  return {path: props.path, children: children};
}

function NotFound(_props, children) {
  invariant(
    typeof children === 'function',
    "NotFound children should be a template");
  return {path: null, children: children};
}

module.exports = {

  Pages: createRouter(React.DOM.body),
  Page: Route,

  Locations: createRouter(React.DOM.div),
  Location: Route,

  NotFound: NotFound
}
