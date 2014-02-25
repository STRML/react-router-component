"use strict";

var React   = require('react');
var Router  = require('./Router');
var Route   = require('./Route');
var Link    = require('./Link');

module.exports = {
  Locations: Router.Locations,
  Pages: Router.Pages,

  Location: Route.Route,
  Page: Route.Route,
  NotFound: Route.NotFound,

  Link: Link
}
