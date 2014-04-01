"use strict";

var React         = require('react');
var Environment   = require('./environment');

/**
 * Mixin which makes router bound to an environment.
 *
 * It expects a component to implement:
 *  - `onNavigation(path, navigation, callback)` which will be called by
 *    environment it is bound to when path changes.
 *  - `getMatch()` which returns a match object this router should provide as
 *    the basis for all contextual routers down the hierarchy.
 */
var RoutingEnvironmentMixin = {

  propTypes: {
    prefix: React.PropTypes.string,
    path: React.PropTypes.string,
    contextual: React.PropTypes.bool,
    hash: React.PropTypes.bool
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

  /**
   * Navigate to a path
   *
   * @param {String} path
   * @param {Callback} cb
   */
  navigate: function(path, navigation, cb) {
    if (typeof navigation === 'function' && cb === undefined) {
      cb = navigation;
      navigation = {};
    }
    this.setPath(
      this.getAbsolutePath(path),
      navigation || {},
      cb);
  },

  /**
   * If router's routing state is controlled by the owner or it should control
   * its state itself.
   */
  isControlled: function() {
    return this.props.path || this.props.contextual;
  },

  /**
   * Environment which was configured explicitely (if any).
   */
  getConfiguredEnvironment: function(props) {
    props = props || this.props;

    if (props.environment) {
      return props.environment;
    }
    if (props.hash) {
      return Environment.hashEnvironment;
    }
  },

  /**
   * Environment for a router.
   */
  getEnvironment: function(props) {
    props = props || this.props;

    var environment = this.getConfiguredEnvironment(props)

    if (environment) {
      return environment;
    }

    if (props.contextual) {
      var parent = this.getParentRouter(props);
      if (parent) {
        return parent.getEnvironment();
      }
    }

    return Environment.defaultEnvironment;
  },

  /**
   * Return parent router or undefined.
   */
  getParentRouter: function(props) {
    var current = this.context.router;
    var environment = this.getConfiguredEnvironment(props);

    while (current) {
      if (!environment || current.getEnvironment() === environment) {
        return current;
      }
    }
  },

  getPrefix: function() {
    if (this.props.prefix) {
      return this.props.prefix;
    }
    var parent = this.getParentRouter();
    if (this.props.contextual && parent) {
      return parent.getMatch().matchedPath;
    } else {
      return '';
    }
  },

  getPath: function(props) {
    props = props || this.props;

    if (this.props.path) {
      return normalize(this.props.path);
    } else if (this.props.contextual) {
      var parent = this.getParentRouter(props);
      if (parent) {
        return normalize(parent.getMatch().unmatchedPath);
      }
    }

    return normalize(this.getEnvironment().getPath());
  },

  setPath: function(path, navigation, cb) {
    this.getEnvironment().setPath(path, navigation, cb);
  },

  /**
   * Make href scoped for the current router.
   */
  getAbsolutePath: function(href) {
    return join(this.getPrefix(), href);
  },

  componentDidMount: function() {
    if (this.isControlled()) {
      return;
    }
    this.getEnvironment().register(this);
  },

  componentDidUpdate: function() {
    if (this.isControlled()) {
      this.getEnvironment().unregister(this);
    } else {
      this.getEnvironment().register(this);
    }
  },

  componentWillUnmount: function() {
    this.getEnvironment().unregister(this);
  }
};

function normalize(path) {
  return path[0] !== '/' ?  '/' + path : path;
}

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

module.exports = RoutingEnvironmentMixin;
