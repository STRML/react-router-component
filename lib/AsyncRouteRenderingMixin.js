"use strict";

var merge               = require('react/lib/merge');
var cloneWithProps      = require('react/lib/cloneWithProps');
var prefetchAsyncState  = require('react-async/lib/prefetchAsyncState');
var isAsyncComponent    = require('react-async/lib/isAsyncComponent');

/**
 * Mixin for router components which prefetches state of async components
 * (as in react-async).
 */
var AsyncRouteRenderingMixin = {

  setRoutingState: function(state, cb) {
    if (state.handler && isAsyncComponent(state.handler)) {
      // store pending state and start fetching async state of a new handler
      this.setState(
        {pendingState: state},
        this.prefetchMatchHandlerState.bind(null, state, cb)
      );
    } else {
      this.replaceState(state, cb);
    }
  },

  hasPendingUpdate: function() {
    return !!this.state.pendingState;
  },

  prefetchMatchHandlerState: function(state, cb) {
    prefetchAsyncState(state.handler, function(err, handler) {
      // check if we router is still mounted and have the same match in state
      // as we started fetching state with
      if (this.isMounted() &&
          this.state.pendingState &&
          this.state.pendingState.match === state.match) {

        var nextState = merge(this.state.pendingState, {handler: handler});
        this.replaceState(nextState, cb);

      }
    }.bind(this));
  },

  renderRouteHandler: function() {
    var ref = this.state.match.route && this.state.match.route.ref;
    return cloneWithProps(this.state.handler, {ref: ref});
  }

};

module.exports = AsyncRouteRenderingMixin;
