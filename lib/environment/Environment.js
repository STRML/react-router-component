"use strict";

var ReactUpdates  = require('react/lib/ReactUpdates');
var emptyFunction = require('react/lib/emptyFunction');

/**
 * Base abstract class for a routing environment.
 *
 * @private
 */
function Environment() {
  this.routers = [];
  this.path = this.getPath();
}

Environment.prototype.getAbsolutePath = emptyFunction.thatReturnsArgument;

Environment.prototype.navigate = function navigate(path, navigation, cb) {
  return this.setPath(path, navigation, cb);
}

/**
 * Set environment path.
 *
 * This method notifies registered routers.
 *
 * @param {String} path
 * @param {Object} navigation
 * @param {Callback} cb
 */
Environment.prototype.setPath = function(path, navigation, cb) {
  if (typeof navigation === 'function' && cb === undefined) {
    cb = navigation;
    navigation = {};
  }

  navigation = navigation || {};

  // Give routers a chance to cancel navigation.
  for (var i = 0, len = this.routers.length; i < len; i++) {
    var router = this.routers[i];
    if (router.onBeforeNavigation(path, navigation) === false) { return; }
  }

  if (!navigation.isPopState) {
    if (navigation.replace) {
      this.replaceState(path, navigation);
    } else {
      this.pushState(path, navigation);
    }
  }

  this.path = path;

  var latch = this.routers.length;

  if (latch === 0) {
    return cb && cb();
  }

  var callback = function() {
    latch -= 1;
    if (latch === 0) {
      for (var i = 0, len = this.routers.length; i < len; i++) {
        this.routers[i].onNavigation(path, navigation);
      }
      if (cb) {
        cb();
      }
    }
  }.bind(this);

  ReactUpdates.batchedUpdates(function() {
    for (var i = 0, len = this.routers.length; i < len; i++) {
      this.routers[i].setPath(this.path, navigation, callback);
    }
  }.bind(this));
}

/**
 * Register router with an environment.
 */
Environment.prototype.register = function register(router) {
  if (this.routers.indexOf(router) === -1) {
    this.routers.push(router);

    if (this.routers.length === 1) {
      this.start();
    }
  }
}

/**
 * Unregister router from an environment.
 */
Environment.prototype.unregister = function unregister(router) {
  if (this.routers.indexOf(router) > -1) {
    this.routers.splice(this.routers.indexOf(router), 1);

    if (this.routers.length === 0) {
      this.stop();
    }
  }
}

module.exports = Environment;
