"use strict";

var Router            = require('./lib/Router');
var Route             = require('./lib/Route');
var Link              = require('./lib/Link');
var NavigatableMixin  = require('./lib/NavigatableMixin');

module.exports = {
  Locations: Router.Locations,
  Pages: Router.Pages,

  Location: Route.Route,
  Page: Route.Route,
  NotFound: Route.NotFound,

  Link: Link,

  NavigatableMixin: NavigatableMixin
};
