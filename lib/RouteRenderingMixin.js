"use strict";

var React = require('react');
var PropTypes = require('prop-types');
var assign = Object.assign || require('object-assign');


/**
 * Mixin for routers which implements the simplest rendering strategy.
 */
var RouteRenderingMixin = {

  propTypes: {
    childProps: PropTypes.object
  },

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

  renderRouteHandler: function() {
    if (!this.state.match.route) {
      throw new Error("React-router-component: No route matched! Did you define a NotFound route?");
    }
    var handler = this.state.handler;
    var isDOMElement = typeof handler.type === 'string';

    // If this is a DOM element, don't send these props. This won't prevent all
    // warnings in 15.2.0, but it will catch a lot of them.
    var matchProps = isDOMElement ? null : this.state.matchProps;

    var outProps = assign({ref: this.state.match.route.ref}, this.getChildProps(), matchProps);

    // If we were passed an element, we need to clone it before passing it along.
    if (React.isValidElement(handler)) {
      // Be sure to keep the props that were already set on the handler.
      // Otherwise, a handler like <div className="foo">bar</div> would have its className lost.
      return React.cloneElement(handler, assign(outProps, handler.props));
    }
    return React.createElement(handler, outProps);
  }

};

module.exports = RouteRenderingMixin;
