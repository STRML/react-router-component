"use strict";

var React                   = require('react');
var merge                   = require('react/lib/merge');
var cloneWithProps          = require('react/lib/cloneWithProps');
var WaitForAsync            = require('./WaitForAsync');
var RoutingEnvironmentMixin = require('./RoutingEnvironmentMixin');
var matchRoutes             = require('./matchRoutes');

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
function createRouter(name, component) {

  return React.createClass({

    mixins: [RoutingEnvironmentMixin],

    displayName: name,

    getDefaultProps: function() {
      return {component: component};
    },

    getInitialState: function() {
      return {navigation: {}};
    },

    /**
     * Match `path` and return a match object.
     */
    match: function(path) {
      path = path || this.getPath();
      return matchRoutes(this.props.children, path);
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

    /**
    * Notify the component that a new navigation is occurred.
    *
    * @param {String} path
    * @param {String} path
    * @param {Callback} cb
    */
    onNavigation: function(path, navigation, cb) {
      if (this.props.onPathChange) {
        this.props.onPathChange(path, navigation);
      }

      navigation = merge(navigation, {match: this.match()});

      if (this.props.onBeforeNavigation &&
          this.props.onBeforeNavigation(path, navigation) === false) {
        return;
      }

      if (navigation.onBeforeNavigation &&
          navigation.onBeforeNavigation(path, navigation) === false) {
        return;
      }

      this.setState({navigation: navigation}, function() {
        if (this.props.onNavigation) {
          this.props.onNavigation(path, navigation);
        }

        cb();
      }.bind(this));
    },

    render: function() {
      var match = this.match();
      var handler = match.createHandler();

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
