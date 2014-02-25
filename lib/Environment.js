"use strict";
/**
 * Routing environment.
 *
 * It specifies how routers read its state from DOM and synchronise it back.
 */

var ReactUpdates          = require('react/lib/ReactUpdates');
var emptyFunction         = require('react/lib/emptyFunction');
var ExecutionEnvironment  = require('react/lib/ExecutionEnvironment');

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
 * @param {Function} cb
 */
Environment.prototype.notify = function notify(cb) {
  var latch = this.routers.length;

  function callback() {
    latch -= 1;
    if (cb && latch === 0) {
      cb();
    }
  }

  ReactUpdates.batchedUpdates(function() {
    for (var i = 0, len = this.routers.length; i < len; i++) {
      this.routers[i].setPath(this.path, callback);
    }
  }.bind(this));
}

/**
 * Get router from an environment.
 */
Environment.prototype.getRouter = function getRouter() {
  return this.routers[0];
}

/**
 * Register router with an environment.
 */
Environment.prototype.register = function register(router) {
  if (this.routers.length === 0) {
    this.start();
  }

  if (!router.getParentRouter()) {
    this.routers.push(router);
  }
}

/**
 * Unregister router from an environment.
 */
Environment.prototype.unregister = function unregister(router) {
  this.routers.splice(this.routers.indexOf(router), 1);

  if (this.routers.length === 0) {
    this.stop();
  }
}

/**
 * Routing environment which routes by `location.pathname`.
 */
function PathnameEnvironment() {
  Environment.call(this);
}

PathnameEnvironment.prototype = Object.create(Environment.prototype);
PathnameEnvironment.prototype.constructor = PathnameEnvironment;

PathnameEnvironment.prototype.getPath = function() {
  return window.location.pathname;
}

PathnameEnvironment.prototype.setPath = function(path, cb, retrospective) {
  if (!retrospective) {
    window.history.pushState({}, '', path);
  }
  this.path = path;
  this.notify(cb);
};

PathnameEnvironment.prototype.start = function() {
  window.addEventListener('popstate', this.onPopState.bind(this));
};

PathnameEnvironment.prototype.stop = function() {
  window.removeEventListener('popstate', this.onPopState.bind(this));
};

PathnameEnvironment.prototype.onPopState = function(e) {
  var path = window.location.pathname;

  if (this.path !== path) {
    this.setPath(path, undefined, true);
  }
};

/**
 * Routing environment which routes by `location.hash`.
 */
function HashEnvironment() {
  Environment.call(this);
}

HashEnvironment.prototype = Object.create(Environment.prototype);
HashEnvironment.prototype.constructor = HashEnvironment;

HashEnvironment.prototype.getPath = function() {
  return window.location.hash.slice(1) || '/';
};

HashEnvironment.prototype.setPath = function(path, cb, retrospective) {
  if (!retrospective) {
    window.location.hash = path;
  }
  this.path = path;
  this.notify(cb);
};

HashEnvironment.prototype.start = function() {
  window.addEventListener('hashchange', this.onHashChange.bind(this));
};

HashEnvironment.prototype.stop = function() {
  window.removeEventListener('hashchange', this.onHashChange.bind(this));
};

HashEnvironment.prototype.onHashChange = function() {
  var path = window.location.hash.slice(1);

  if (this.path !== path) {
    this.setPath(path, undefined, true);
  }
};

/**
 * Dummy routing environment which provides no path.
 *
 * Should be used on server or in WebWorker.
 */
function DummyEnvironment() {
  Environment.call(this);
}

DummyEnvironment.prototype = Object.create(Environment.prototype);
DummyEnvironment.prototype.constructor = DummyEnvironment;

DummyEnvironment.prototype.getPath = emptyFunction.thatReturnsNull;

DummyEnvironment.prototype.setPath = function(path, cb) {
  this.path = path;
  cb();
};

DummyEnvironment.prototype.start = emptyFunction;

DummyEnvironment.prototype.stop = emptyFunction;

/**
 * Mixin for routes to keep attached to an environment.
 *
 * This mixin assumes the environment is passed via props.
 */
var Mixin = {

  componentDidMount: function() {
    this.props.environment.register(this);
  },

  componentWillUnmount: function() {
    this.props.environment.unregister(this);
  }
};

var pathnameEnvironment;
var hashEnvironment;
var defaultEnvironment;
var dummyEnvironment;

if (ExecutionEnvironment.canUseDOM) {

  pathnameEnvironment = new PathnameEnvironment();
  hashEnvironment     = new HashEnvironment();
  defaultEnvironment  = (window.history !== undefined) ?
                        pathnameEnvironment :
                        hashEnvironment; 

} else {

  dummyEnvironment    = new DummyEnvironment();
  pathnameEnvironment = dummyEnvironment;
  hashEnvironment     = dummyEnvironment;
  defaultEnvironment  = dummyEnvironment;

}

module.exports = {
  pathnameEnvironment: pathnameEnvironment,
  hashEnvironment: hashEnvironment,
  defaultEnvironment: defaultEnvironment,
  dummyEnvironment: dummyEnvironment,
  Mixin: Mixin
};
