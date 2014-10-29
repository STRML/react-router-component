"use strict";

var pattern   = require('url-pattern');
var assign    = Object.assign || require('object.assign');
var invariant = require('react/lib/invariant');
var React     = require('react');

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

    // We expect to be passed an Element. If we weren't, and were just passed props,
    // mock an Element's structure.
    if (!React.isValidElement(current)) {
      current = {props: current, ref: current.ref};
    }

    if (process.env.NODE_ENV !== "production") {
      invariant(
        current.props.handler !== undefined && current.props.path !== undefined,
        "Router should contain either Route or NotFound components " +
        "as routes")
    }

    if (current.props.path) {
      current.props.pattern = current.props.pattern || pattern.newPattern(current.props.path);
      if (!page) {
        match = current.props.pattern.match(path);
        if (match) {
          page = current;
        }
        // Regex matches are not named, so they go in the `_` array, much like splats.
        if (Array.isArray(match)) {
          match = {_: match};
        }
      }
    }
    if (!notFound && current.props.path === null) {
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

Match.prototype.getHandler = function() {
  if (!this.route) return undefined;
  var props = assign({}, this.route.props, this.match);
  delete props.pattern;
  delete props.path;
  delete props.handler;
  return this.route.props.handler(props);
}

module.exports = matchRoutes;
