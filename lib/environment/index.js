"use strict";
/**
 * Routing environment.
 *
 * It specifies how routers read its state from DOM and synchronise it back.
 */

var ExecutionEnvironment  = require('react/lib/ExecutionEnvironment');
var DummyEnvironment      = require('./DummyEnvironment');
var Environment           = require('./Environment');

/**
 * Mixin for routes to keep attached to an environment.
 *
 * This mixin assumes the environment is passed via props.
 */
var Mixin = {

  componentDidMount: function() {
    this.getEnvironment().register(this);
  },

  componentWillUnmount: function() {
    this.getEnvironment().unregister(this);
  }
};

var PathnameEnvironment;
var HashEnvironment;
var QueryStringKeyEnvironment;

var pathnameEnvironment;
var hashEnvironment;
var defaultEnvironment;
var dummyEnvironment;
var queryStringKeyEnvironment;

if (ExecutionEnvironment.canUseDOM) {

  PathnameEnvironment = require('./PathnameEnvironment');
  HashEnvironment     = require('./HashEnvironment');
  QueryStringKeyEnvironment = require('./QuerystringKeyEnvironment');

  pathnameEnvironment = new PathnameEnvironment();
  hashEnvironment     = new HashEnvironment();
  queryStringKeyEnvironment = new QueryStringKeyEnvironment();
  defaultEnvironment  = (window.history !== undefined) ?
                        pathnameEnvironment :
                        hashEnvironment;

} else {

  dummyEnvironment    = new DummyEnvironment();
  pathnameEnvironment = dummyEnvironment;
  hashEnvironment     = dummyEnvironment;
  defaultEnvironment  = dummyEnvironment;

}

module.exports = {
  pathnameEnvironment: pathnameEnvironment,
  hashEnvironment: hashEnvironment,
  queryStringKeyEnvironment: queryStringKeyEnvironment,
  defaultEnvironment: defaultEnvironment,
  dummyEnvironment: dummyEnvironment,

  Environment: Environment,
  PathnameEnvironment: PathnameEnvironment,
  QueryStringKeyEnvironment: QueryStringKeyEnvironment,
  HashEnvironment: HashEnvironment,
  Mixin: Mixin
};
