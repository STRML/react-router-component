"use strict";

var React                   = require('react');
var merge                   = require('react/lib/merge');
var invariant               = require('react/lib/invariant');

/**
 * Mixin whick keeps track of routing state.
 *
 * It expects a component to implement the following methods:
 *
 *   - `getRoutingState(path, navigation, props)` which computes a new routing
 *   - `getMatch(state)` which extracts a match object from the state
 */
var RoutingStateMixin = {

  propTypes: {
    onPathChange: React.PropTypes.func,
    onBeforeNavigation: React.PropTypes.func,
    onNavigation: React.PropTypes.func
  },

  getInitialState: function() {
    return this.getRoutingState();
  },

  componentWillReceiveProps: function(nextProps) {
    var nextState = this.getRoutingState(undefined, undefined, nextProps);
    this.setState(nextState);
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

    var state = this.getRoutingState(path, navigation);

    navigation = merge(navigation, {match: this.getMatch(state)});

    if (this.props.onBeforeNavigation &&
        this.props.onBeforeNavigation(path, navigation) === false) {
      return;
    }

    if (navigation.onBeforeNavigation &&
        navigation.onBeforeNavigation(path, navigation) === false) {
      return;
    }

    this.setState(state, function() {
      if (this.props.onNavigation) {
        this.props.onNavigation(path, navigation);
      }
      cb();
    }.bind(this));
  }
};

module.exports = RoutingStateMixin;
