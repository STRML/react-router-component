"use strict";

var React  = require('react');
var cloneWithProps = require('react/lib/cloneWithProps');
var assign = Object.assign || require('object.assign');


/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  renderRouteHandler: function(props) {
    var handler = this.state.handler;
    props = assign({ref: this.state.match.route.ref}, props);
    // If we were passed an element, we need to clone it before passing it along.
    if (React.isValidElement(handler)) {
      return cloneWithProps(handler, props);
    }
    return React.createElement(handler, props);
  }

};

module.exports = RouteRenderingMixin;
