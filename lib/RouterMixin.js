"use strict";

var React         = require('react');
var PropTypes     = require('prop-types');
var invariant     = require('./util/invariant');
var assign        = Object.assign || require('object-assign');
var matchRoutes   = require('./matchRoutes');
var Environment   = require('./environment');
var shallowEqual  = require('is-equal-shallow');

var RouterMixin = {
  mixins: [Environment.Mixin],

  propTypes: {
    // Added by matches
    _: PropTypes.array,
    _query: PropTypes.object,
    hash: PropTypes.bool,
    // User props
    path: PropTypes.string,
    contextual: PropTypes.bool,
    onBeforeNavigation: PropTypes.func,
    onNavigation: PropTypes.func,
    urlPatternOptions: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.object
    ])
  },

  childContextTypes: {
    router: PropTypes.any
  },

  getChildContext: function() {
    return {
      router: this
    };
  },

  contextTypes: {
    router: PropTypes.any
  },

  getInitialState: function() {
    return this.getRouterState(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    if (!shallowEqual(nextProps, this.props)) {
      var nextState = this.getRouterState(nextProps);
      this.delegateSetRoutingState(nextState);
    }
  },

  getRouterState: function(props) {
    var path;
    var prefix;
    var query;

    var parent = props.contextual && this.getParentRouter();

    if (parent) {
      // Build our new path based off the parent. A navigation may be in progress, in which case
      // we as well want the newest data so we use the pending match.
      var parentMatch = parent._pendingMatch || parent.getMatch();

      invariant(
        props.path ||
        isString(parentMatch.unmatchedPath) ||
        parentMatch.matchedPath === parentMatch.path,
        "contextual router has nothing to match on: %s", parentMatch.unmatchedPath
      );

      path = props.path || parentMatch.unmatchedPath || '/';
      prefix = parent.state.prefix + parentMatch.matchedPath;
      query = parentMatch.query;
    } else {

      path = props.path || this.getEnvironment().getPath();

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

    var match = matchRoutes(this.getRoutes(props), path, query, this.getURLPatternOptions());

    return {
      match: match,
      matchProps: match.getProps(),
      handler: match.getHandler(),
      prefix: prefix,
      navigation: {},
      path: path
    };
  },

  getEnvironment: function() {
    if (this.props.environment) {
      return this.props.environment;
    }
    if (this.props.hash) {
      return Environment.hashEnvironment;
    }
    if (this.props.contextual && this.context.router) {
      return this.context.router.getEnvironment();
    }
    return Environment.defaultEnvironment;
  },

  /**
   * Return parent router or undefined.
   */
  getParentRouter: function() {
    var current = this.context.router;
    var environment = this.getEnvironment();

    if (current) {
      if (current.getEnvironment() === environment) {
        return current;
      }
    }
  },

  /**
   * Return current match.
   */
  getMatch: function() {
    return this.state.match;
  },

  getURLPatternOptions: function() {
    var parent = this.getParentRouter();
    var parentOptions = parent && parent.getURLPatternOptions();
    // Check existence so we don't return an empty object if there are no options.
    if (parentOptions) {
      return assign({}, this.props.urlPatternOptions, parentOptions);
    }
    return this.props.urlPatternOptions;
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
   * @param {Function} navigation
   * @param {Callback} cb
   */
  navigate: function(path, navigation, cb) {
    path = join(this.state.prefix, path);
    this.getEnvironment().setPath(path, navigation, cb);
  },

  /**
   * Set new path.
   *
   * This function is called by environment.
   *
   * @private
   *
   * @param {String} path
   * @param {Function} navigation
   * @param {Callback} cb
   */
  setPath: function(path, navigation, cb) {
    var state = this.getRouterState(this.props);
    state.navigation = navigation;

    if (this.props.onBeforeNavigation &&
        this.props.onBeforeNavigation(state.path, navigation, state.match) === false) {
      return;
    }

    if (navigation.onBeforeNavigation &&
        navigation.onBeforeNavigation(state.path, navigation, state.match) === false) {
      return;
    }

    this.delegateSetRoutingState(state, function() {
      if (this.props.onNavigation) {
        this.props.onNavigation(state.path, navigation, state.match);
      }
      cb();
    }.bind(this));
  },

  /**
   * Return the current path
   */
  getPath: function () {
    return this.state.match.path;
  },

  /**
   * Try to delegate state update to a setRoutingState method (might be provided
   * by router itself) or use replaceState.
   */
  delegateSetRoutingState: function(state, cb) {
    // Store this here so it can be accessed by child contextual routers in onBeforeNavigation.
    this._pendingMatch = state.match;

    if (this.setRoutingState) {
      this.setRoutingState(state, cb);
    } else {
      this.setState(state, cb);
    }
  }

};

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

function isString(o) {
  return Object.prototype.toString.call(o) === '[object String]';
}

module.exports = RouterMixin;
