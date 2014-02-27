"use strict";

/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  renderRouteHandler: function() {
    return this.state.match.getHandler();
  }

};

module.exports = RouteRenderingMixin;
