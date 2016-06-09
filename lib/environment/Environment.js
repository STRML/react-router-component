"use strict";

// batchedUpdates is now exposed in 0.12
var batchedUpdates = require("react-dom").unstable_batchedUpdates || require('react').batchedUpdates;

/**
 * Base abstract class for a routing environment.
 *
 * @private
 */
function Environment() {
  this.routers = [];
  this.path = this.getPath();
}

/**
 * Notify routers about the change.
 *
 * @param {Object} navigation
 * @param {Function} cb
 */
Environment.prototype.notify = function notify(navigation, cb) {
  var latch = this.routers.length;

  if (latch === 0) {
    return cb && cb();
  }

  function callback() {
    latch -= 1;
    if (cb && latch === 0) {
      cb();
    }
  }

  batchedUpdates(function() {
    for (var i = 0, len = this.routers.length; i < len; i++) {
      this.routers[i].setPath(this.path, navigation, callback);
    }
  }.bind(this));
};

Environment.prototype.makeHref = function makeHref(path) {
  return path;
};

Environment.prototype.navigate = function navigate(path, navigation, cb) {
  return this.setPath(path, navigation, cb);
};

Environment.prototype.setPath = function(path, navigation, cb) {
  // Support (path, cb) arity.
  if (typeof navigation === 'function' && cb === undefined) {
    cb = navigation;
    navigation = {};
  }
  // Support (path) arity.
  if (!navigation) navigation = {};

  if (!navigation.isPopState) {
    if (navigation.replace) {
      this.replaceState(path, navigation);
    } else {
      this.pushState(path, navigation);
    }
  }
  this.path = path;
  this.notify(navigation, cb);
};

/**
 * Register router with an environment.
 */
Environment.prototype.register = function register(router) {
  if (this.routers.length === 0) {
    this.start();
  }

  this.routers.push(router);
};

/**
 * Unregister router from an environment.
 */
Environment.prototype.unregister = function unregister(router) {
  if (this.routers.indexOf(router) > -1) {
    this.routers.splice(this.routers.indexOf(router), 1);
  }

  if (this.routers.length === 0) {
    this.stop();
  }
};

module.exports = Environment;
