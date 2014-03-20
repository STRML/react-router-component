"use strict";

var pattern   = require('url-pattern');
var mergeInto = require('react/lib/mergeInto');
var invariant = require('react/lib/invariant');

/**
 * Match rotues against a path
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

    if (process.env.NODE_ENV !== "production") {
      invariant(
        current.handler !== undefined && current.path !== undefined,
        "Router should contain either Route or NotFound components " +
        "as routes")
    }

    if (current.path) {
      current.pattern = current.pattern || pattern(current.path);
      if (!page) {
        match = current.pattern.match(path);
        if (match) {
          page = current;
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

  this.unmatchedPath = this.match && this.match._ ?
    this.match._[0] :
    null;

  this.matchedPath = this.unmatchedPath ?
    this.path.substring(0, this.path.length - this.unmatchedPath.length) :
    this.path;
}

Match.prototype.getHandler = function(ignoreRef) {
  var props = {
    ref: !ignoreRef && this.route ? this.route.ref : undefined
  };
  if (this.route && this.match) {
    mergeInto(props, this.match);
    mergeInto(props, this.route.props);
  }
  return this.route ? this.route.handler(props) : undefined;
}

module.exports = matchRoutes;
