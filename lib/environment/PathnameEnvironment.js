"use strict";

var Environment = require('./Environment');

/**
 * Routing environment which routes by `location.pathname`.
 */
function PathnameEnvironment() {
  this.onPopState = this.onPopState.bind(this);
  this.useHistoryApi = !!(window.history &&
                          window.history.pushState &&
                          window.history.replaceState);
  Environment.call(this);
}

PathnameEnvironment.prototype = Object.create(Environment.prototype);
PathnameEnvironment.prototype.constructor = PathnameEnvironment;

PathnameEnvironment.prototype.getPath = function() {
  return window.location.pathname + window.location.search;
};

PathnameEnvironment.prototype.pushState = function(path, navigation) {
  if (this.useHistoryApi) {
    window.history.pushState({}, '', path);
  } else {
    window.location.pathname = path;
  }
};

PathnameEnvironment.prototype.replaceState = function(path, navigation) {
  if (this.useHistoryApi) {
    window.history.replaceState({}, '', path);
  } else {
    window.location.pathname = path;
  }
};

PathnameEnvironment.prototype.start = function() {
  if (this.useHistoryApi && window.addEventListener) {
    window.addEventListener('popstate', this.onPopState);
  }
};

PathnameEnvironment.prototype.stop = function() {
  if (this.useHistoryApi && window.removeEventListener) {
    window.removeEventListener('popstate', this.onPopState);
  }
};

PathnameEnvironment.prototype.onPopState = function(e) {
  var path = window.location.pathname;

  if (this.path !== path) {
    this.setPath(path, {isPopState: true});
  }
};

module.exports = PathnameEnvironment;
