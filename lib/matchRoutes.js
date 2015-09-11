"use strict";

var URLPattern = require('url-pattern');
var invariant = require('./util/invariant');
var React = require('react');
var assign = Object.assign || require('object.assign');
var qs = require('qs');

var patternCache = {};

/**
 * Match routes against a path
 *
 * @param {Array.<Route>} routes
 * @param {String} path
 */
function matchRoutes(routes, path) {
  var createCompiler = require('../index').createURLPatternCompiler;

  var match, page, notFound, queryObj;

  if (!Array.isArray(routes)) {
    routes = [routes];
  }

  path = path.split('?');
  var pathToMatch = path[0];
  var queryString = path[1];
  if (queryString) {
    queryObj = qs.parse(queryString);
  }

  for (var i = 0, len = routes.length; i < len; i++) {
    var current = routes[i];
    // Simply skip null or undefined to allow ternaries in route definitions
    if (!current) continue;

    if (process.env.NODE_ENV !== "production") {
      invariant(
        current.props.handler !== undefined && current.props.path !== undefined,
        "Router should contain either Route or NotFound components as routes");
    }

    if (current.props.path) {
      // Technically, this cache will incorrectly be used if a user defines two routes
      // with identical paths but different compilers. FIXME?
      var pattern = patternCache[current.props.path] ||
                    new URLPattern(current.props.path, createCompiler(current.props));
      if (!page) {
        match = pattern.match(pathToMatch);
        if (match) {
          page = current;
        }
        // Parse RegExp matches, which are returned as an array rather an an object.
        if (Array.isArray(match)) {
          match = parseMatch(current, match);
        }

        // Backcompat fix; url-pattern removed the array wrapper
        if (match && match._ && !Array.isArray(match._)) {
          match._ = [match._];
        }

      }
    }
    if (!notFound && current.props.path === null) {
      notFound = current;
    }
  }

  return new Match(
    pathToMatch,
    page ? page : notFound ? notFound : null,
    match,
    queryObj
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
function Match(path, route, match, query) {
  this.path = path;
  this.route = route;
  this.match = match;
  this.query = query;

  this.unmatchedPath = this.match && this.match._ ?
    this.match._[0] :
    null;

  this.matchedPath = this.unmatchedPath ?
    this.path.substring(0, this.path.length - this.unmatchedPath.length) :
    this.path;
}

Match.prototype.getProps = function() {
  var props = assign({}, this.route.props, this.match);
  // Querystring is assigned as _query.
  props._query = this.query || {};

  // Delete props that shouldn't be passed to the handler.
  delete props.pattern;
  delete props.path;
  delete props.handler;

  return props;
}

Match.prototype.getHandler = function() {
  if (!this.route) return undefined;

  return this.route.props.handler;
};

module.exports = matchRoutes;
