"use strict";

var React           = require('react');
var mergeInto       = require('react/lib/mergeInto');
var cloneWithProps  = require('react/lib/cloneWithProps');
var RouterMixin     = require('./RouterMixin');
var ReactAsyncMixin = require('./ReactAsyncMixin');

var AsyncRouterMixin = {

  mixins: [RouterMixin],

  shouldComponentUpdate: function(nextProps, nextState) {

    if (nextState.pendingChildren) {
      return true;
    }

    var match = nextState.match;
    var children = match.getChildren(true);

    if (ReactAsyncMixin.isAsyncComponent(children)) {

      ReactAsyncMixin.prefetchAsyncState(children, function(err, children) {
        // check if we router is still mounted and have the same match in state
        // as we started fetching state with
        if (this.isMounted() && this.state.match === match) {

          this.replaceState({
            match: this.state.match,
            prefix: this.state.prefix,
            pendingChildren: children
          });

        }
      }.bind(this));

      return false;
    }

    return true;
  },

  renderChildren: function() {
    if (this.state.pendingChildren) {
      var ref = this.state.match.route && this.state.match.route.ref;
      return cloneWithProps(this.state.pendingChildren, {ref: ref});
    } else {
      return this.state.match.getChildren();
    }
  }

}

function createRouter(name, component) {
  return React.createClass({
    mixins: [AsyncRouterMixin],

    displayName: name,

    getDefaultProps: function() {
      return {
        component: component
      }
    },

    render: function() {
      var children = this.renderChildren();
      return this.transferPropsTo(this.props.component(null, children));
    }
  });
}

module.exports = {
  Locations: createRouter('Locations', React.DOM.div),
  Pages: createRouter('Pages', React.DOM.body)
}

