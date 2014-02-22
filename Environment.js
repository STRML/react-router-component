"use strict";

var merge         = require('react/lib/merge');
var ReactUpdates  = require('react/lib/ReactUpdates');
var emptyFunction = require('react/lib/emptyFunction');

/**
 * Base methods for an environment.
 *
 * @private
 */
var EnvironmentBase = {

  notify: function(cb) {
    var latch = this.routers.length;
    ReactUpdates.batchedUpdates(function() {
      for (var i = 0, len = this.routers.length; i < len; i++) {
        this.routers[i].setPath(this.path, function() {
          latch -= 1;
          if (cb && latch === 0) {
            cb();
          }
        });
      }
    }.bind(this));
  },

  getRouter: function() {
    return this.routers[0];
  },

  register: function(router) {
    if (this.routers.length === 0) {
      this.start();
    }

    if (!router.getParentRouter()) {
      this.routers.push(router);
    }
  },

  unregister: function(router) {
    this.routers.splice(this.routers.indexOf(router), 1);

    if (this.routers.length === 0) {
      this.stop();
    }
  }
};

/**
 * Routing method which routes on window.location.pathname.
 */
var PathnameRoutingMethod = merge(EnvironmentBase, {

  getPath: function() {
    return window.location.pathname;
  },

  setPath: function(path, cb, retrospective) {
    if (!retrospective) {
      window.history.pushState({}, '', path);
    }
    this.path = path;
    this.notify(cb);
  },

  start: function() {
    window.addEventListener('popstate', this.onPopState.bind(this));
  },

  stop: function() {
    window.removeEventListener('popstate', this.onPopState.bind(this));
  },

  onPopState: function(e) {
    var path = window.location.pathname;

    if (this.path !== path) {
      this.setPath(path, undefined, true);
    }
  }
});

/**
 * Routing method which routes on window.location.hash.
 */
var HashRoutingMethod = merge(EnvironmentBase, {

  getPath: function() {
    return window.location.hash.slice(1);
  },

  setPath: function(path, cb, retrospective) {
    if (!retrospective) {
      window.location.hash = path;
    }
    this.path = path;
    this.notify(cb);
  },

  start: function() {
    window.addEventListener('hashchange', this.onHashChange.bind(this));
  },

  stop: function() {
    window.removeEventListener('hashchange', this.onHashChange.bind(this));
  },

  onHashChange: function() {
    var path = window.location.hash.slice(1);

    if (this.path !== path) {
      this.setPath(path, undefined, true);
    }
  }
});

/**
 * Dummy routing method which does nothing.
 *
 * Should be used on server or in WebWorker.
 */
var DummyRoutingMethod = merge(EnvironmentBase,  {

  getPath: emptyFunction.thatReturnsNull,

  setPath: function(path, cb) {
    this.path = path;
    cb();
  },

  start: emptyFunction,

  stop: emptyFunction
});

/**
 * Create new routing environment which routes with specified method.
 *
 * @param {Object} method
 */
function createEnvironment(method) {
  var env = Object.create(method);
  env.path = env.getPath();
  env.routers = [];

  return env;
}

module.exports.createEnvironment = createEnvironment;
module.exports.PathnameRoutingMethod = PathnameRoutingMethod;
module.exports.HashRoutingMethod = HashRoutingMethod;
module.exports.DummyRoutingMethod = DummyRoutingMethod;
