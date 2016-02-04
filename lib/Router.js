"use strict";

var React                     = require('react');
var RouterMixin               = require('./RouterMixin');
var RouteRenderingMixin       = require('./RouteRenderingMixin');
var assign                    = Object.assign || require('object-assign');

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
function createRouter(name, component) {

  return React.createClass({

    mixins: [RouterMixin, RouteRenderingMixin],

    displayName: name,

    getRoutes: function(props) {
      return props.children;
    },

    getDefaultProps: function() {
      return {
        component: component
      };
    },

    render: function() {
      // Render the Route's handler.
      var handler = this.renderRouteHandler(this.props.childProps);

      if (!this.props.component) {
        return handler;
      } else {
        // Pass all props except this component to the Router (containing div/body) and the children,
        // which are swapped out by the route handler.
        var props = assign({}, this.props);
        delete props.component;
        delete props.children;
        delete props.childProps;
        return React.createElement(this.props.component, props, handler);
      }
    }
  });
}

module.exports = {
  createRouter: createRouter,
  Locations: createRouter('Locations', 'div'),
  Pages: createRouter('Pages', 'body')
};
