"use strict";

var cloneWithProps = require('react/lib/cloneWithProps');

/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  renderRouteHandler: function() {
    var handler = this.state.handler;
    return cloneWithProps(handler, {ref: this.state.match.route.ref});
  }

};

module.exports = RouteRenderingMixin;
