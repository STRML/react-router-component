'use strict';

var Environment = require('./Environment');

/**
* Routing environment which stores routing state in localStorage.
*/
function LocalStorageKeyEnvironment(key) {
  this.key = key;
  var store = this.onStorage = this.onStorage.bind(this);
  var storage;

  try {
    storage = window.localStorage;
    storage.setItem(key, storage.getItem(key));
  } catch (e) {
    storage = null;
  }

  this.storage = storage || {
    data: {},
    getItem: function(itemKey) {return this.data[itemKey]; },
    setItem: function(itemKey, val) {
      this.data[itemKey] = val;
      clearTimeout(this.storeEvent);
      this.storeEvent = setTimeout(store, 1);
    }
  };

  Environment.call(this);
}

LocalStorageKeyEnvironment.prototype = Object.create(Environment.prototype);
LocalStorageKeyEnvironment.prototype.constructor = LocalStorageKeyEnvironment;

LocalStorageKeyEnvironment.prototype.getPath = function() {
  return this.storage.getItem(this.key) || '';
};

LocalStorageKeyEnvironment.prototype.pushState = function(path, navigation) {
  this.storage.setItem(this.key, path);
};

LocalStorageKeyEnvironment.prototype.replaceState = function(path, navigation) {
  this.storage.setItem(this.key, path);
};

LocalStorageKeyEnvironment.prototype.start = function() {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('storage', this.onStorage, false);
  }
};

LocalStorageKeyEnvironment.prototype.stop = function() {
  if (typeof window !== 'undefined' && window.removeEventListener) {
    window.removeEventListener('storage', this.onStorage, false);
  }
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
