'use strict';
var React = require('react');
var Router = require('react-router-component');
var TransitionGroup = require('react/lib/ReactCSSTransitionGroup');

/**
 * AnimatedLocations is an extension of the <Locations> object that animates route transitions.
 */
var AnimatedLocations = React.createClass({
  mixins: [
    Router.AsyncRouteRenderingMixin,
    Router.RouterMixin,
    React.addons.PureRenderMixin
  ],

  getDefaultProps: function() {
    return {
      component: 'div'
    }
  },

  render: function() {
    // A key MUST be set in order for transitionGroup to work.
    var handler = this.renderRouteHandler({key: this.state.match.path});
    // TransitionGroup takes in a `component` property, and so does AnimatedLocations, so we pass through
    return <TransitionGroup {...this.props}>{handler}</TransitionGroup>;
  }
});

module.exports = AnimatedLocations;
