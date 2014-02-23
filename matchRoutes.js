"use strict";

var pattern   = require('url-pattern');
var merge     = require('react/lib/merge');
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

function Match(path, route, match) {
  this.path = path;
  this.route = route;
  this.match = match;
  this.unmatched = this.match && this.match._ ? this.match._[0] : null;
}

Match.prototype.getChildren = function() {
  return this.route ?
    this.route.handler(merge(this.match, this.route.props)) :
    undefined;
}

module.exports = matchRoutes;
