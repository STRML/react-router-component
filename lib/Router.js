"use strict";

var React                     = require('react');
var RouterMixin               = require('./RouterMixin');
var AsyncRouteRenderingMixin  = require('./AsyncRouteRenderingMixin');
var assign                    = Object.assign || require('object.assign');

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
function createRouter(name, component) {

  return React.createClass({

    mixins: [RouterMixin, AsyncRouteRenderingMixin],

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
      var handler = this.renderRouteHandler();
      // Pass all props except this component to the Router (containing div/body).
      var props = assign({}, this.props);
      delete props.component;
      return React.createElement(this.props.component, props, handler);
    }
  });
}

module.exports = {
  createRouter: createRouter,
  Locations: createRouter('Locations', 'div'),
  Pages: createRouter('Pages', 'body')
};
