"use strict";

var React = require('react');
var assign = Object.assign || require('object-assign');


/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  // Props passed at the `childProps` key are passed to all handlers.
  getChildProps: function() {
    var childProps = this.props.childProps || {};
    // Merge up from parents, with inner props taking priority.
    var parent = this.getParentRouter();
    if (parent) {
      childProps = assign({}, parent.getChildProps(), childProps);
    }
    return childProps;
  },

  renderRouteHandler: function(props) {
    if (!this.state.match.route) {
      throw new Error("React-router-component: No route matched! Did you define a NotFound route?");
    }
    var handler = this.state.handler;
    var matchProps = this.state.matchProps;

    props = assign({ref: this.state.match.route.ref}, this.getChildProps(), props, matchProps);
    // If we were passed an element, we need to clone it before passing it along.
    if (React.isValidElement(handler)) {
      // Be sure to keep the props that were already set on the handler.
      // Otherwise, a handler like <div className="foo">bar</div> would have its className lost.
      return React.cloneElement(handler, assign(props, handler.props));
    }
    return React.createElement(handler, props);
  }

};

module.exports = RouteRenderingMixin;
