"use strict";

var React       = require('react');
var invariant   = require('react/lib/invariant');
var matchRoutes = require('./matchRoutes');
var Environment = require('./Environment');

var RouterMixin = {
  mixins: [Environment.Mixin],

  propTypes: {
    path: React.PropTypes.string,
    contextual: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      environment: this.props.hash ?
        Environment.hashEnvironment :
        Environment.defaultEnvironment
    };
  },

  childContextTypes: {
    router: React.PropTypes.component
  },

  getChildContext: function() {
    return {
      router: this
    };
  },

  contextTypes: {
    router: React.PropTypes.component,
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
      prefix: prefix
    };
  },

  componentWillReceiveProps: function() {
    this.replaceState(this.getInitialState());
  },

  /**
   * Return parent router or undefined.
   */
  getParentRouter: function() {
    return this.context.router;
  },

  /**
   * Return current match.
   */
  getMatch: function() {
    return this.state.match;
  },

  /**
   * Make href scoped for the current router.
   */
  makeHref: function(href) {
    return join(this.state.prefix, href);
  },

  /**
   * Navigate to a path
   *
   * @param {String} path
   * @param {Callback} cb
   */
  navigate: function(path, cb) {
    path = join(this.state.prefix, path);
    this.props.environment.setPath(path, cb);
  },

  /**
   * Set new path.
   *
   * This funciton is called by environment.
   *
   * @private
   *
   * @param {String} path
   * @param {Callback} cb
   */
  setPath: function(path, cb) {
    this.replaceState({
      match: matchRoutes(this.props.children, path),
      prefix: this.state.prefix,
    }, cb);
  }

};

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]';
}

module.exports = RouterMixin;
