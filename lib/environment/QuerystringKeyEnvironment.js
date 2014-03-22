"use strict";

var qs                  = require('querystring');
var PathnameEnvironment = require('./PathnameEnvironment');

/**
 * Environment which keeps routing state in a specified key in a querystring.
 */
function QuerystringKeyEnvironment(key) {
  this.key = key;
  PathnameEnvironment.call(this);
}

QuerystringKeyEnvironment.prototype = Object.create(PathnameEnvironment.prototype);
QuerystringKeyEnvironment.prototype.constructor = QuerystringKeyEnvironment;

QuerystringKeyEnvironment.prototype.getPath = function() {
  var path = PathnameEnvironment.prototype.getPath.call(this);
  if (path.indexOf('?') === -1) {
    return '/';
  }
  var query = qs.parse(path.split('?')[1] || '');
  return query[this.key] ? '/' + query[this.key] : '/';
};

QuerystringKeyEnvironment.prototype.pushState = function(path, navigation) {
  path = this.updatedPath(path);
  PathnameEnvironment.prototype.pushState.call(this, path, navigation);
}

QuerystringKeyEnvironment.prototype.replaceState = function(path, navigation) {
  path = this.updatedPath(path);
  PathnameEnvironment.prototype.replaceState.call(this, path, navigation);
}

QuerystringKeyEnvironment.prototype.updatedPath = function(value) {
  var path = PathnameEnvironment.prototype.getPath.call(this);
  if (path.indexOf('?') === -1) {
    var query = {};
    query[this.key] = value.slice(1);
    return '/?' + qs.stringify(query);
  } else {
    var splitted = path.split('?');
    var query = qs.parse(splitted[1] || '');
    query[this.key] = value.slice(1);
    return splitted[0] + '?' + qs.stringify(query);
  }
}
var _environments = {};

function getEnvironment(key) {
  if (_environments[key] === undefined) {
    _environments[key] = new QuerystringKeyEnvironment(key);
  }
  return _environments[key];
}

module.exports = QuerystringKeyEnvironment;
module.exports.getEnvironment = getEnvironment;
