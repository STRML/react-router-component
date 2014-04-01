"use strict";

var React               = require('react');
var cloneWithProps      = require('react/lib/cloneWithProps');
var ReactUpdates        = require('react/lib/ReactUpdates');
var emptyFunction       = require('react/lib/emptyFunction');
var prefetchAsyncState  = require('react-async/lib/prefetchAsyncState');
var isAsyncComponent    = require('react-async/lib/isAsyncComponent');

var WaitForAsync = React.createClass({

  propTypes: {
    children: React.PropTypes.component.isRequired,
    onAsyncStateFetched: React.PropTypes.func,
    onBeforeUpdate: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      onAsyncStateFetched: emptyFunction,
      onBeforeUpdate: emptyFunction
    };
  },

  getInitialState: function() {
    return {
      rendered: this.props.children,
      pending: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (isAsyncComponent(nextProps.children) &&
        nextProps.children.type !== this.state.rendered.type) {

      this.setState({
        pending: nextProps.children
      }, this.prefetchAsyncState.bind(null, nextProps.children));

    } else {

      this.setState({
        rendered: nextProps.children,
        pending: null
      });

    }
  },

  render: function() {
    return cloneWithProps(this.state.rendered, {ref: 'rendered'});
  },

  /**
   * Get the currently rendered component instance.
   *
   * Do not use it in a real code, this is provided only for testing purposes.
   *
   * @returns {ReactComponent}
   */
  getRendered: function() {
    return this.refs.rendered;
  },

  /**
   * Check if there's update pending.
   *
   * @returns {boolean}
   */
  hasPendingUpdate: function() {
    return this.state.pending !== null;
  },

  /**
   * Prefetch async state for a component and update state.
   *
   * @param {ReactComponent} component
   */
  prefetchAsyncState: function(component) {
    prefetchAsyncState(component, function(err, nextRendered) {
      ReactUpdates.batchedUpdates(function() {
        this.props.onAsyncStateFetched();
        if (this.state.pending === component && this.isMounted()) {
          this.props.onBeforeUpdate();
          this.setState({
            rendered: nextRendered,
            pending: null
          });
        }
      }.bind(this));
    }.bind(this));
  }
});

module.exports = WaitForAsync;
