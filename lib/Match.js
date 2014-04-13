"use strict";

var merge     = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');

/**
 * Match object
 *
 * @private
 */
function Match(path, route, matches) {
  this.path = path;
  this.route = route;
  this.match = null;
  this.isNotFound = matches === null;
  this.unmatchedPath = null;

  if (this.route) {
    var keys = this.route.keys;
    if (keys) {
      this.match = {};
      for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        this.match[key.name] = matches[i + 1];
      }
    }

    this.unmatchedPath = matches && matches.length > keys.length + 1 ?
      matches[this.route.keys.length + 1] :
      null;
  }

  this.matchedPath = this.unmatchedPath ?
    this.path.substring(0, this.path.length - this.unmatchedPath.length) :
    this.path;
}

Match.prototype.createHandler = function(props) {
  props = props ? merge({}, props) : {};
  if (this.match) {
    mergeInto(props, this.match);
  }
  if (this.route && this.route.props) {
    mergeInto(props, this.route.props);
  }
  return this.route ? this.route.handler(props) : undefined;
}

module.exports = Match;
