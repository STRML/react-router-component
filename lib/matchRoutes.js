"use strict";

var pathToRegexp  = require('path-to-regexp');
var invariant     = require('react/lib/invariant');
var Match         = require('./Match');

/**
 * Match rotues against a path
 *
 * @param {Array.<Route>} routes
 * @param {String} path
 */
function matchRoutes(routes, path) {
  var route, match, notFound;

  if (!Array.isArray(routes)) {
    routes = [routes];
  }

  for (var i = 0, len = routes.length; i < len; i++) {
    var current = routes[i];

    if (process.env.NODE_ENV !== "production") {
      invariant(
        current.handler !== undefined && (current.path !== undefined || current.pattern !== undefined),
        "Router should contain either Route or NotFound components " +
        "as routes")
    }

    if (current.path || current.pattern) {
      if (!current.pattern) {
        current.keys = current.keys || [];
        current.pattern = pathToRegexp(current.path, current.keys);
      }
      if (!route) {
        match = current.pattern.exec(path);
        if (match) {
          route = current;
        }
      }
    }
    if (!notFound && (current.path === null || current.pattern === null)) {
      notFound = current;
    }
  }

  return new Match(
    path,
    route ? route : notFound ? notFound : null,
    match
  );
}

module.exports = matchRoutes;
