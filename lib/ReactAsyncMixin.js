"use strict";
/**
 * ReactAsyncMixin defines a mixin and a set of method for working with
 * components which can fetch part of their state using an asynchronous method,
 * `getInitialStateAsync(cb)`.
 */

var invariant       = require('react/lib/invariant');
var cloneWithProps  = require('react/lib/cloneWithProps');

/**
 * Mixin for asynchronous components.
 *
 * Asynchronous state is fetched via `getInitialStateAsync(cb)` method but also
 * can be injected via `asyncState` prop. In the latter case
 * `getInitialStateAsync` won't be called at all.
 */
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
