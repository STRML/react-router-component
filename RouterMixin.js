"use strict";

var React       = require('react');
var invariant   = require('react/lib/invariant');
var matchRoutes = require('./matchRoutes');

var RouterMixin = {

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

    if (this.props.contextual && this.context.router) {

      var match = this.context.router.getMatch();

      invariant(
        this.props.path || isString(match.unmatchedPath),
        "contextual router has nothing to match on: %s", match.unmatchedPath
      );

      path = this.props.path || match.unmatchedPath;
      prefix = match.matchedPath;
    } else {

      path = this.props.path || this.props.environment.getPath();

      invariant(
        isString(path),
        ("router operate in environment which cannot provide path, " +
         "pass it a path prop; or probably you want to make it contextual")
      );

      prefix = '';
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    return {
      match: matchRoutes(this.props.children, path),
      previousMatch: null,
      prefix: prefix
    };
  },

  componentWillReceiveProps: function() {
    this.setState(this.getInitialState());
  },

  getMatch: function() {
    return this.state.match;
  },

  makeHref: function(href) {
    return join(this.state.prefix, href);
  },

  navigate: function(path, cb) {
    path = join(this.state.prefix, path);
    this.props.environment.setPath(path, cb);
  },

  setPath: function(path, cb) {
    this.setState({
      match: matchRoutes(this.props.children, path),
      previousMatch: this.state.match
    }, cb);
  },

  getParentRouter: function() {
    return this.context.router;
  }

};

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]';
}

module.exports = RouterMixin;
