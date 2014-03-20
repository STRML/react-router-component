"use strict";

var Router                    = require('./lib/Router');
var Route                     = require('./lib/Route');
var Link                      = require('./lib/Link');

var RouterMixin               = require('./lib/RouterMixin');
var AsyncRouteRenderingMixin  = require('./lib/AsyncRouteRenderingMixin');
var RouteRenderingMixin       = require('./lib/RouteRenderingMixin');

var NavigatableMixin          = require('./lib/NavigatableMixin');

var Environment               = require('./lib/Environment');

module.exports = {
  Locations: Router.Locations,
  Pages: Router.Pages,

  Location: Route.Route,
  Page: Route.Route,
  NotFound: Route.NotFound,

  Link: Link,

  Environment: Environment,

  RouterMixin: RouterMixin,
  RouteRenderingMixin: RouteRenderingMixin,
  AsyncRouteRenderingMixin: AsyncRouteRenderingMixin,

  NavigatableMixin: NavigatableMixin
};
