"use strict";

var React               = require('react');
var cloneWithProps      = require('react/lib/cloneWithProps');
var prefetchAsyncState  = require('react-async/lib/prefetchAsyncState');
var isAsyncComponent    = require('react-async/lib/isAsyncComponent');
var RouterMixin         = require('./RouterMixin');

var AsyncRouterMixin = {

  mixins: [RouterMixin],

  shouldComponentUpdate: function(nextProps, nextState) {

    if (nextState.pendingChildren) {
      return true;
    }

    var match = nextState.match;
    var handler = match.getHandler(true);

    if (isAsyncComponent(handler)) {

      prefetchAsyncState(handler, function(err, handler) {
        // check if we router is still mounted and have the same match in state
        // as we started fetching state with
        if (this.isMounted() && this.state.match === match) {

          this.replaceState({
            match: this.state.match,
            prefix: this.state.prefix,
            pendingChildren: handler
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
      return this.state.match.getHandler();
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

    getRoutes: function() {
      return this.props.children;
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

