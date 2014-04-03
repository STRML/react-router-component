"use strict";

var React         = require('react');
var merge         = require('react/lib/merge');
var Environment   = require('./environment');
var invariant     = require('react/lib/invariant');

/**
 * Mixin which makes router bound to an environment. This is the glue that binds
 * the component's state to the environment.
 *
 *
 * It expects a component to implement:
 *  - `match(path)` which will be called to determine how the path should be
 *    routed.
 *  - `render()` which will render based on the current state of the component.
 *    Generally, this means it should call `getPath()`, which will return the
 *    correct value regardless of whether the component is "controlled" or
 *    not—unlike `props.path` and `state.path` which should NOT be used.
 */
var RoutingEnvironmentMixin = {

  propTypes: {
    environment: React.PropTypes.object,
    prefix: React.PropTypes.string,
    path: React.PropTypes.string,
    contextual: React.PropTypes.bool,
    hash: React.PropTypes.bool,

    onBeforeNavigation: React.PropTypes.func,
    onNavigation: React.PropTypes.func
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
    return {
      path: this.props.defaultPath || (this.props.path ? null : this.getEnvironment().getPath())
    }
  },

  /**
   * Navigate to a path
   *
   * @param {String} path
   * @param {Callback} cb
   */
  navigate: function(path, navigation, cb) {
    invariant(
      !this.isControlled(),
      "You can't call navigate() on a controlled router."
    )
    if (typeof navigation === 'function' && cb === undefined) {
      cb = navigation;
      navigation = {};
    }

    this.getEnvironment().setPath(
      this.getAbsolutePath(path),
      navigation,
      function() {
        if (this.props.onNavigation) {
          this.props.onNavigation(path, navigation);
        }

        cb();
      }.bind(this));
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
  getConfiguredEnvironment: function() {
    if (this.props.environment) {
      return this.props.environment;
    }
    if (this.props.hash) {
      return Environment.hashEnvironment;
    }
  },

  /**
   * Environment for a router.
   */
  getEnvironment: function() {
    var environment = this.getConfiguredEnvironment()

    if (environment) {
      return environment;
    }

    if (this.props.contextual) {
      var parent = this.getParentRouter();
      if (parent) {
        return parent.getEnvironment();
      }
    }

    return Environment.defaultEnvironment;
  },

  /**
   * Return parent router or undefined.
   */
  getParentRouter: function() {
    var current = this.context.router;
    var environment = this.getConfiguredEnvironment();

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
      return parent.match(parent.getPath()).matchedPath;
    } else {
      return '';
    }
  },

  getPath: function() {
    if (this.props.path) {
      return normalize(this.props.path);
    } else if (this.props.contextual) {
      var parent = this.getParentRouter();
      if (parent) {
        return normalize(parent.match(parent.getPath()).unmatchedPath);
      }
    }

    return this.state.path;
  },

  /**
   * Update the state to reflect the current path. This is called by the
   * environment whenever the path changes.
   */
  onPathChange: function(path) {
    this.setState({path: normalize(path)});
  },

  onBeforeNavigation: function(path, navigation) {
    navigation = merge(navigation, {match: this.match(path)});
    if (this.props.onBeforeNavigation) {
      if (this.props.onBeforeNavigation(path, navigation) === false) {
        return false;
      }
    }
    if (navigation.onBeforeNavigation) {
      return navigation.onBeforeNavigation(path, navigation);
    }
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
