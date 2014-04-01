"use strict";

var merge     = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');

/**
 * Match object
 *
 * @private
 */
function Match(path, route, match) {
  this.path = path;
  this.route = route;
  this.match = match;
  this.isNotFound = match === null;

  this.unmatchedPath = this.match && this.match._ ?
    this.match._[0] :
    null;

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
