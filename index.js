"use strict";

var Router                    = require('./lib/Router');
var Route                     = require('./lib/Route');
var Link                      = require('./lib/Link');

var RouterMixin               = require('./lib/RouterMixin');
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

  NavigatableMixin: NavigatableMixin,
  CaptureClicks: CaptureClicks
};

module.exports = exportsObject;
