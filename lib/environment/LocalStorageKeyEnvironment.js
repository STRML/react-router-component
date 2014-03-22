"use strict";

var Environment = require('./Environment');

/**
 * Routing environment which stores routing state in localStorage.
 */
function LocalStorageKeyEnvironment(key) {
  this.key = key;
  this.onStorage = this.onStorage.bind(this);
  Environment.call(this);
}

LocalStorageKeyEnvironment.prototype = Object.create(Environment.prototype);
LocalStorageKeyEnvironment.prototype.constructor = LocalStorageKeyEnvironment;

LocalStorageKeyEnvironment.prototype.getPath = function() {
  return window.localStorage.getItem(this.key);
};

LocalStorageKeyEnvironment.prototype.pushState = function(path, navigation) {
  window.localStorage.setItem(this.key, path);
};

LocalStorageKeyEnvironment.prototype.replaceState = function(path, navigation) {
  window.localStorage.setItem(this.key, path);
};

LocalStorageKeyEnvironment.prototype.start = function() {
  window.addEventListener('storage', this.onStorage, false);
};

LocalStorageKeyEnvironment.prototype.stop = function() {
  window.removeEventListener('storage', this.onStorage);
};

LocalStorageKeyEnvironment.prototype.onStorage = function() {
  var path = this.getPath();

  if (this.path !== path) {
    this.setPath(path, {});
  }
};

var _environments = {};

function getEnvironment(key) {
  if (_environments[key] === undefined) {
    _environments[key] = new LocalStorageKeyEnvironment(key);
  }
  return _environments[key];
}

module.exports = LocalStorageKeyEnvironment;
module.exports.getEnvironment = getEnvironment;
