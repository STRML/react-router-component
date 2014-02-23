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
    var fullPath = this.getEnvironment().getPath();

    if (this.props.contextual && this.context.router) {

      var match = this.context.router.getMatch();

      invariant(
        this.props.path || isString(match.unmatched),
        "contextual router has nothing to match on: %s", match.unmatched
      );

      path = this.props.path || match.unmatched;
      prefix = fullPath.substring(0, fullPath.length - path.length);
    } else {

      path = this.props.path || fullPath;

      invariant(
        isString(path),
        "router operate in environment which cannot provide path, pass it a path prop"
      );

      prefix = '';
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    return {
      match: matchRoutes(this.props.children, path),
      prefix: prefix
    };
  },

  componentWillReceiveProps: function() {
    this.setState(this.getInitialState());
  },

  getMatch: function() {
    return this.state.match;
  },

  navigate: function(path, cb) {
    path = join(this.state.prefix, path);
    this.getEnvironment().setPath(path, cb);
  },

  setPath: function(path, cb) {
    this.setState({match: matchRoutes(this.props.children, path)}, cb);
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
