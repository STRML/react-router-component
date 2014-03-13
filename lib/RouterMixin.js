"use strict";

var React         = require('react');
var invariant     = require('react/lib/invariant');
var matchRoutes   = require('./matchRoutes');
var Environment   = require('./Environment');
var emptyFunction = require('react/lib/emptyFunction');
var events = { start: 'navigateStart', success: 'navigateSuccess' };

var RouterMixin = {
  mixins: [Environment.Mixin],

  propTypes: {
    path: React.PropTypes.string,
    contextual: React.PropTypes.bool,
    eventHandler: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.shape({
        emit: React.PropTypes.func
      })
    ])
  },

  getDefaultProps: function() {
    return {
      environment: this.props.hash ?
        Environment.hashEnvironment :
        Environment.defaultEnvironment,
      eventHandler: emptyFunction
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
    router: React.PropTypes.component
  },

  getInitialState: function() {
    return this.getRouterState(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    var nextState = this.getRouterState(nextProps);
    this.replaceState(nextState);
  },

  getRouterState: function(props) {
    var path;
    var prefix;

    if (props.contextual && this.context.router) {

      var match = this.context.router.getMatch();

      invariant(
        props.path || isString(match.unmatchedPath),
        "contextual router has nothing to match on: %s", match.unmatchedPath
      );

      path = props.path || match.unmatchedPath;
      prefix = match.matchedPath;
    } else {

      path = props.path || props.environment.getPath();

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
      match: matchRoutes(this.getRoutes(props), path),
      prefix: prefix,
      navigation: {}
    };
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
  navigate: function(path, navigation, cb) {
    var handler = this.props.eventHandler;
    if (typeof navigation === 'function' && cb === undefined) {
      cb = navigation;
      navigation = {};
    }
    path = join(this.state.prefix, path);
    (handler.emit || handler).call(handler, events.start, path);
    this.props.environment.setPath(path, navigation, cb);
  },

  /**
   * Set new path.
   *
   * This function is called by environment.
   *
   * @private
   *
   * @param {String} path
   * @param {String} path
   * @param {Callback} cb
   */
  setPath: function(path, navigation, cb) {
    var self = this;
    self.replaceState({
      match: matchRoutes(this.getRoutes(this.props), path),
      prefix: self.state.prefix,
      navigation: navigation
    }, function () {
      var handler = self.props.eventHandler;
      (handler.emit || handler).call(handler, events.success, path);
      cb.apply(null, arguments);
    });
  },

  /**
   * Return the current path
   */
  getPath: function () {
    return this.state.match.path;
  }

};

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]';
}

module.exports = RouterMixin;
