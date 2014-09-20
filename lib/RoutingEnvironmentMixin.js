"use strict";

var React         = require('react');
var merge         = require('react/lib/merge');
var Environment   = require('./environment');

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
    onNavigation: React.PropTypes.func,
    onDispatch: React.PropTypes.func
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
    if (typeof navigation === 'function' && cb === undefined) {
      cb = navigation;
      navigation = {};
    }

    this.getEnvironment().setPath(
      this.getAbsolutePath(path),
      navigation,
      function() {
        if (cb) {
          cb();
        }
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

  getEnvironmentListener: function() {
    if (!this.environmentListener) {
      this.environmentListener = new EnvironmentListener(this);
    }
    return this.environmentListener;
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
   * Make href scoped for the current router.
   */
  getAbsolutePath: function(href) {
    return join(this.getPrefix(), href);
  },

  componentWillMount: function() {
    if (this.props.onDispatch) {
      var path = this.getPath();
      this.props.onDispatch(path, {
        initial: true,
        isPopState: false,
        match: this.match(path)
      });
    }
  },

  componentDidMount: function() {
    if (this.isControlled()) {
      return;
    }
    this.getEnvironment().register(this.getEnvironmentListener());
  },

  componentDidUpdate: function() {
    if (this.isControlled()) {
      this.getEnvironment().unregister(this.getEnvironmentListener());
    } else {
      this.getEnvironment().register(this.getEnvironmentListener());
    }
  },

  componentWillUnmount: function() {
    this.getEnvironment().unregister(this.getEnvironmentListener());
  }
};

function normalize(path) {
  return path[0] !== '/' ?  '/' + path : path;
}

function join(a, b) {
  return (a + b).replace(/\/\//g, '/');
}

/**
 * An object that observes events from the Environment and translates them to
 * actions on the RoutingEnvironmentMixin. By using this object (instead of
 * registering the RoutingEnvironmentMixin instance itself), we're able to avoid
 * adding `onNavigation` (etc) methods that are likely to conflict with
 * user-defined callbacks.
 */
function EnvironmentListener(router) {
  this.router = router;
}

/**
 * Update the state to reflect the current path. This is called by the
 * environment whenever the path changes.
 */
EnvironmentListener.prototype.setPath = function (path, navigation, cb) {
  this.router.setState({path: normalize(path)}, cb);
}

EnvironmentListener.prototype.onBeforeNavigation = function(path, navigation) {
  navigation = merge(navigation, {match: this.router.match(path)});
  if (this.router.props.onBeforeNavigation) {
    if (this.router.props.onBeforeNavigation(path, navigation) === false) {
      return false;
    }
  }
  if (navigation.onBeforeNavigation) {
    return navigation.onBeforeNavigation(path, navigation);
  }
}

EnvironmentListener.prototype.onNavigation = function(path, navigation) {
  var result;
  if (this.router.props.onNavigation) {
    result = this.router.props.onNavigation(path, navigation);
  }
  if (this.router.props.onDispatch) {
    this.router.props.onDispatch(path, navigation);
  }
  return result;
}

module.exports = RoutingEnvironmentMixin;
