"use strict";

var prefetchAsyncState  = require('react-async/lib/prefetchAsyncState');
var isAsyncComponent    = require('react-async/lib/isAsyncComponent');
var cloneWithProps      = require('react/lib/cloneWithProps');

/**
 * Mixin for router components which prefetches state of async components
 * (as in react-async).
 */
var AsyncRouteRenderingMixin = {

  shouldComponentUpdate: function(nextProps, nextState) {

    if (nextState.pendingChildren) {
      return true;
    }

    var match = nextState.match;
    var handler = match.getHandler(true);

    if (handler && isAsyncComponent(handler)) {

      prefetchAsyncState(handler, function(err, handler) {
        // check if we router is still mounted and have the same match in state
        // as we started fetching state with
        if (this.isMounted() && this.state.match === match) {

          this.replaceState({
            match: this.state.match,
            prefix: this.state.prefix,
            navigation: this.state.navigation,
            pendingChildren: handler
          });

        }
      }.bind(this));

      return false;
    }

    return true;
  },

  renderRouteHandler: function() {
    if (this.state.pendingChildren) {
      var ref = this.state.match.route && this.state.match.route.ref;
      return cloneWithProps(this.state.pendingChildren, {ref: ref});
    } else {
      return this.state.match.getHandler();
    }
  }

};

module.exports = AsyncRouteRenderingMixin;
