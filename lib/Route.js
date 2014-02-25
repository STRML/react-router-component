"use strict";

var invariant = require('react/lib/invariant');
var merge     = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');

/**
 * Create a new route descriptor from a specification.
 *
 * @param {Object} spec
 * @param {?Object} defaults
 */
function createRoute(spec, defaults) {

  var handler = spec.handler;
  var path = spec.path;
  var ref = spec.ref;
  var props = merge({}, spec);

  delete props.path;
  delete props.handler;
  delete props.ref;

  var route = {
    path: path,
    handler: handler,
    props: props,
    ref: ref
  };

  if (defaults) {
    mergeInto(route, defaults);
  }

  invariant(
    typeof route.handler === 'function',
    "Route handler should be a component or a function but got: %s", handler
  );

  invariant(
    route.path !== undefined,
    "Route should have an URL pattern specified: %s", handler
  );

  return route;
}

/**
 * Regular route descriptor.
 *
 * @param {Object} spec
 */
function Route(spec) {
  return createRoute(spec);
}

/**
 * Catch all route descriptor.
 *
 * @param {Object} spec
 */
function NotFound(spec) {
  return createRoute(spec, {path: null});
}

module.exports = {
  Route: Route,
  NotFound: NotFound
};
