"use strict";

var React                     = require('react');
var CreateReactClass          = require('create-react-class');
var PropTypes                 = require('prop-types');
var RouterMixin               = require('./RouterMixin');
var RouteRenderingMixin       = require('./RouteRenderingMixin');
var assign                    = Object.assign || require('object-assign');
var omit                      = require('object.omit');

// These are keys to omit - useful for preventing 15.2.0 warning regarding unknown props on DOM els
var PROP_KEYS = ['component']
  .concat(Object.keys(RouterMixin.propTypes))
  .concat(Object.keys(RouteRenderingMixin.propTypes));

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
function createRouter(name, component) {

  return CreateReactClass({

    mixins: [RouterMixin, RouteRenderingMixin],

    displayName: name,

    propTypes: {
      component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.func
      ])
    },

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

      if (!this.props.component) {
        return handler;
      } else {
        // Pass all props except this component to the Router (containing div/body) and the children,
        // which are swapped out by the route handler.
        var props = assign({}, this.props);
        props = omit(props, PROP_KEYS);
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
