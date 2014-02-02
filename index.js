"use strict";
var React     = require('react');
var invariant = require('react/lib/invariant');
var pattern   = require('url-pattern');

function createRouter(component) {
  return React.createClass({
    getInitialState: function() {
      return {
        location: this.props.location || window.location
      }
    },

    componentDidMount: function() {
      window.addEventListener('popstate', this.onPopState);
    },

    componentWillUnmount: function() {
      window.removeEventListener('popstate', this.onPopState);
    },

    onPopState: function(e) {
      e.preventDefault();
      this.setState({location: window.location});
    },

    render: function() {
      var match, page, notFound;
      var len, i;

      for (i = 0, len = this.props.children.length; i < len; i++) {
        var current = this.props.children[i];

        if (process.env.NODE_ENV !== "production") {
          invariant(
            current.children !== undefined && current.path !== undefined,
            "Router should contain either Route or NotFound components as children")
        }

        if (current.path) {
          current.pattern = current.pattern || pattern(current.path);
          if (!page) {
            match = current.pattern.match(this.state.location.pathname);
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

      children.unshift(this.props);
      return component.apply(component, children(this.state.location, match));
    }
  });
}

function Route(props, children) {
  invariant(typeof children === 'function');
  return {path: props.path, children: children};
}

function NotFound(_props, children) {
  invariant(typeof children === 'function');
  return {path: null, children: children};
}

module.exports = {

  Pages: createRouter(React.DOM.body),
  Page: Route,

  Locations: createRouter(React.DOM.div),
  Location: Route,

  NotFound: NotFound
}
