"use strict";

var pattern   = require('url-pattern');
var mergeInto = require('react/lib/mergeInto');
var invariant = require('react/lib/invariant');

/**
 * Match routes against a path
 *
 * @param {Array.<Route>} routes
 * @param {String} path
 */
function matchRoutes(routes, path) {
  var match, page, notFound;

  if (!Array.isArray(routes)) {
    routes = [routes];
  }

  for (var i = 0, len = routes.length; i < len; i++) {
    var current = routes[i];
    // Simply skip null or undefined to allow ternaries in route definitions
    if (!current) continue;

    if (process.env.NODE_ENV !== "production") {
      invariant(
        current.handler !== undefined && current.path !== undefined,
        "Router should contain either Route or NotFound components " +
        "as routes")
    }

    if (current.path) {
      current.pattern = current.pattern || pattern.newPattern(current.path);
      if (!page) {
        match = current.pattern.match(path);
        if (match) {
          page = current;
        }
        // Regex matches are not named, so they go in the `_` array, much like splats.
        if (Array.isArray(match)) {
          match = {_: match};
        }
      }
    }
    if (!notFound && current.path === null) {
      notFound = current;
    }
  }

  return new Match(
    path,
    page ? page : notFound ? notFound : null,
    match
  );
}

/**
 * Match object
 *
 * @private
 */
function Match(path, route, match) {
  this.path = path;
  this.route = route;
  this.match = match;

  var hasMatch = this.match && this.match._;
  this.unmatchedPath = hasMatch ? this.match._[0] : "/";

  this.matchedPath = hasMatch ?
    this.path.substring(0, this.path.length - this.unmatchedPath.length) :
    this.path;
}

Match.prototype.getHandler = function() {
  var props = {};
  if (this.match) {
    mergeInto(props, this.match);
  }
  if (this.route && this.route.props) {
    mergeInto(props, this.route.props);
  }
  // we will set ref later during a render call
  delete props.ref;
  return this.route ? this.route.handler(props) : undefined;
}

module.exports = matchRoutes;
