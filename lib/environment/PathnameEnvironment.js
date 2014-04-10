"use strict";

var Environment = require('./Environment');

var pushStateIsSupported = (window.history !== undefined &&
                            window.history.pushState !== undefined);

/**
 * Routing environment which routes by `location.pathname`.
 */
function PathnameEnvironment() {
  this.onPopState = this.onPopState.bind(this);
  Environment.call(this);
}

PathnameEnvironment.prototype = Object.create(Environment.prototype);
PathnameEnvironment.prototype.constructor = PathnameEnvironment;

PathnameEnvironment.prototype.getPath = function() {
  return window.location.pathname;
}

PathnameEnvironment.prototype.pushState = function(path, navigation) {
  if (pushStateIsSupported) {
    window.history.pushState({}, '', path);
  } else {
    window.location.href = path;
  }
}

PathnameEnvironment.prototype.replaceState = function(path, navigation) {
  if (pushStateIsSupported) {
    window.history.replaceState({}, '', path);
  } else {
    window.location.replace(path);
  }
}

PathnameEnvironment.prototype.start = function() {
  window.addEventListener('popstate', this.onPopState);
};

PathnameEnvironment.prototype.stop = function() {
  window.removeEventListener('popstate', this.onPopState);
};

PathnameEnvironment.prototype.onPopState = function(e) {
  var path = window.location.pathname;

  if (this.path !== path) {
    this.setPath(path, {isPopState: true});
  }
};

module.exports = PathnameEnvironment;
