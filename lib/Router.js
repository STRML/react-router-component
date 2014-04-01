"use strict";

var React                   = require('react');
var cloneWithProps          = require('react/lib/cloneWithProps');
var WaitForAsync            = require('./WaitForAsync');
var RoutingEnvironmentMixin = require('./RoutingEnvironmentMixin');
var RoutingStateMixin       = require('./RoutingStateMixin');
var matchRoutes             = require('./matchRoutes');

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
function createRouter(name, component) {

  return React.createClass({

    mixins: [RoutingEnvironmentMixin, RoutingStateMixin],

    displayName: name,

    getDefaultProps: function() {
      return {
        component: component
      }
    },

    getRoutingState: function(path, navigation, props) {
      return {
        match: this.match(path, props),
        navigation: navigation || {}
      };
    },

    /**
     * Match `path` and return a match object.
     */
    match: function(path, props) {
      path = path || this.getPath(props);
      props = props || this.props;
      return matchRoutes(props.children, path);
    },

    getMatch: function(state) {
      state = state || this.state;
      return state.match;
    },

    /**
     * This is for testing purposes only.
     */
    getRendered: function() {
      if (this.refs.rendered) {
        return this.refs.rendered.getRendered();
      }
    },

    hasPendingUpdate: function() {
      return this.refs.rendered && this.refs.rendered.hasPendingUpdate();
    },

    render: function() {
      var handler = this.state.match.createHandler();

      if (handler) {
        handler = WaitForAsync({ref: 'rendered'}, handler);
      }

      return this.transferPropsTo(this.props.component(null, handler));
    }
  });
}

module.exports = {
  createRouter: createRouter,
  Locations: createRouter('Locations', React.DOM.div),
  Pages: createRouter('Pages', React.DOM.body),
}
