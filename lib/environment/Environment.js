"use strict";

var ReactUpdates  = require('react/lib/ReactUpdates');
var emptyFunction = require('react/lib/emptyFunction');

/**
 * Base abstract class for a routing environment.
 *
 * @private
 */
function Environment() {
  this.observers = [];
  this.path = this.getPath();
}

Environment.prototype.getAbsolutePath = emptyFunction.thatReturnsArgument;

Environment.prototype.navigate = function navigate(path, navigation, cb) {
  return this.setPath(path, navigation, cb);
}

/**
 * Set environment path.
 *
 * This method notifies registered observers.
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

  // Give observers a chance to cancel navigation.
  for (var i = 0, len = this.observers.length; i < len; i++) {
    var observer = this.observers[i];
    if (observer.onBeforeNavigation(path, navigation) === false) { return; }
  }

  if (!navigation.isPopState) {
    if (navigation.replace) {
      this.replaceState(path, navigation);
    } else {
      this.pushState(path, navigation);
    }
  }

  this.path = path;

  var latch = this.observers.length;

  var callback = function() {
    latch -= 1;
    if (latch === 0) {
      for (var i = 0, len = this.observers.length; i < len; i++) {
        this.observers[i].onNavigation(path, navigation);
      }
      if (cb) {
        cb();
      }
    }
  }.bind(this);

  ReactUpdates.batchedUpdates(function() {
    for (var i = 0, len = this.observers.length; i < len; i++) {
      this.observers[i].setPath(this.path, navigation, callback);
    }
  }.bind(this));
}

/**
 * Register observer with an environment.
 */
Environment.prototype.register = function register(observer) {
  if (this.observers.indexOf(observer) === -1) {
    this.observers.push(observer);

    if (this.observers.length === 1) {
      this.start();
    }
  }
}

/**
 * Unregister observer from an environment.
 */
Environment.prototype.unregister = function unregister(observer) {
  if (this.observers.indexOf(observer) > -1) {
    this.observers.splice(this.observers.indexOf(observer), 1);

    if (this.observers.length === 0) {
      this.stop();
    }
  }
}

module.exports = Environment;
