"use strict";

var pattern   = require('url-pattern');
var invariant = require('react/lib/invariant');
var React  = require('react');
var cloneWithProps = require('react/lib/cloneWithProps');
var assign = Object.assign || require('object.assign');

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
        // Parse RegExp matches, which are returned as an array rather an an object.
        if (Array.isArray(match)) {
          match = parseMatch(current, match);
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
 * Given the currently matched Location & the match array, transform the matches to named key/value pairs,
 * if possible.
 * @param  {Route} current Matched Route.
 * @param  {Array} match   Array of matches from RegExp.
 * @return {Object}        Key/value pairs to feed to the route's handler.
 */
function parseMatch(current, match) {
  if (Array.isArray(current.props.matchKeys)) {
    return current.props.matchKeys.reduce(function(memo, key, i) {
      memo[key] = match[i];
      return memo;
    }, {});
  }
  return {_: match};
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
  var handler = this.route.props.handler;
  // Passed an element - clone it with the props from the route
  if (React.isValidElement(handler)) {
    return cloneWithProps(handler, props);
  }
  // Passed a component descriptor - create an element. Assign it the ref
  // from the <Location> tag.
  return React.createElement(handler, props);
}

module.exports = matchRoutes;
