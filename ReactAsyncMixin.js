"use strict";

var invariant       = require('react/lib/invariant');
var mergeInto       = require('react/lib/mergeInto');
var cloneWithProps  = require('react/lib/cloneWithProps');

var Mixin = {

  getInitialState: function() {
    return this.props.asyncState || {};
  },

  componentDidMount: function() {

    invariant(
      isAsyncComponent(this),
      "%s uses mixinReactAsyncMixin and should provide getInitialStateAsync(cb) function",
      this.displayName
    );

    if (!this.props.asyncState) {
      this.getInitialStateAsync(this._onStateReady);
    }
  },

  _onStateReady: function(err, state) {
    if (err) {
      throw err;
    }

    if (this.isMounted()) {
      this.setState(state);
    }
  }
};

/**
 * Check if a component is an async component.
 *
 * @param {ReactComponent} component
 */
function isAsyncComponent(component) {
  return typeof Object.getPrototypeOf(component).getInitialStateAsync === 'function';
}

/**
 * Prefect an async state for an async component instance.
 *
 * @param {ReactComponent} component
 * @param {Callback} cb
 */
function prefetchAsyncState(component, cb) {
  invariant(
    isAsyncComponent(component),
    "%s should be an async component to be able to prefetch async state, " +
    "but getInitialStateAsync(cb) method is missing or is not a function",
    component.displayName
  );

  var getInitialStateAsync = Object.getPrototypeOf(component).getInitialStateAsync;

  getInitialStateAsync.call(component, function(err, asyncState) {
    if (err) {
      return cb(err);
    }

    cb(null, cloneWithProps(component, {asyncState: asyncState}));
  });
}

module.exports = {
  Mixin: Mixin,
  isAsyncComponent: isAsyncComponent,
  prefetchAsyncState: prefetchAsyncState
}
