"use strict";

var Router                    = require('./lib/Router');
var Route                     = require('./lib/Route');
var Link                      = require('./lib/Link');

var RoutingEnvironmentMixin   = require('./lib/RoutingEnvironmentMixin');

var NavigatableMixin          = require('./lib/NavigatableMixin');

var environment               = require('./lib/environment');

module.exports = {
  Locations: Router.Locations,
  Pages: Router.Pages,

  Location: Route.Route,
  Page: Route.Route,
  NotFound: Route.NotFound,

  Link: Link,

  environment: environment,

  RoutingEnvironmentMixin: RoutingEnvironmentMixin,

  NavigatableMixin: NavigatableMixin
};
