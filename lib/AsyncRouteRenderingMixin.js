"use strict";

var merge               = require('react/lib/merge');
var prefetchAsyncState  = require('react-async/lib/prefetchAsyncState');
var isAsyncComponent    = require('react-async/lib/isAsyncComponent');
var RouteRenderingMixin = require('./RouteRenderingMixin');

/**
 * Mixin for router components which prefetches state of async components
 * (as in react-async).
 */
var AsyncRouteRenderingMixin = {
  mixins: [RouteRenderingMixin],

  setRoutingState: function(state, cb) {
    var currentHandler = this.state && this.state.handler;
    var nextHandler = state && state.handler;

    if (nextHandler &&
        isAsyncComponent(nextHandler) &&
        // if component's type is the same we would need to skip async state
        // update
        !(currentHandler && currentHandler.type === nextHandler.type)) {
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
  }
};

module.exports = AsyncRouteRenderingMixin;
