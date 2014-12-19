"use strict";

var React  = require('react');
var cloneWithProps = require('react/lib/cloneWithProps');

/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  renderRouteHandler: function() {
    var handler = this.state.handler;
    // If we were passed an element, we need to clone it before passing it along.
    var props = {ref: this.state.match.route.ref};
    if (React.isValidElement(handler)) {
      return cloneWithProps(handler, props);
    }
    return React.createElement(handler, props);
  }

};

module.exports = RouteRenderingMixin;
