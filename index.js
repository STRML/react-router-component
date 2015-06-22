"use strict";

var Router                    = require('./lib/Router');
var Route                     = require('./lib/Route');
var Link                      = require('./lib/Link');

var RouterMixin               = require('./lib/RouterMixin');
var AsyncRouteRenderingMixin  = require('./lib/AsyncRouteRenderingMixin');
var RouteRenderingMixin       = require('./lib/RouteRenderingMixin');

var NavigatableMixin          = require('./lib/NavigatableMixin');

var environment               = require('./lib/environment');

var CaptureClicks             = require('./lib/CaptureClicks');

var URLPattern                = require('url-pattern');

var exportsObject = {
  Locations: Router.Locations,
  Pages: Router.Pages,

  Location: Route.Route,
  Page: Route.Route,
  NotFound: Route.NotFound,

  Link: Link,

  environment: environment,

  RouterMixin: RouterMixin,
  RouteRenderingMixin: RouteRenderingMixin,
  AsyncRouteRenderingMixin: AsyncRouteRenderingMixin,

  NavigatableMixin: NavigatableMixin,
  CaptureClicks: CaptureClicks,

  // The fn used to create a compiler for "/user/:id"-style routes is exposed here so it can be overridden.
  createURLPatternCompiler: function() {
    return new URLPattern.Compiler();
  },

  // For ES6 imports, which can't modify module.exports directly
  setCreateURLPatternCompilerFactory: function(fn) {
    exportsObject.createURLPatternCompiler = fn;
  }
};

module.exports = exportsObject;
