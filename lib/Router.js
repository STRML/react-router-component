"use strict";

var React                   = require('react');
var merge                   = require('react/lib/merge');
var Preloaded               = require('react-async/lib/Preloaded');
var RoutingEnvironmentMixin = require('./RoutingEnvironmentMixin');
var matchRoutes             = require('./matchRoutes');

/**
 * A router has two responsibilities:
 *
 * 1. to determine whether it has a match for a particular path
 * 2. to render contents for the current path
 */
var RouterMixin = {

    mixins: [RoutingEnvironmentMixin],

    match: function(path) {
      var routes = this.props.path;
      var memoized = this._memoized;

      if (memoized && memoized.routes === routes && memoized.path === path) {
        return memoized.match;
      } else {
        var match = matchRoutes(this.props.children, path);
        this._memoized = {
          match: match,
          routes: routes,
          path: path
        };
        return match;
      }
    },

    componentWillMount: function() {
      this._memoized = undefined;
    },

    componentWillUnmount: function() {
      this._memoized = undefined;
    },

    getRendered: function() {
      if (this.refs.rendered) {
        return this.refs.rendered.getRendered();
      }
    },

    hasPendingUpdate: function() {
      return this.refs.rendered && this.refs.rendered.hasPendingUpdate();
    },

    render: function() {
      var handler = this.match(this.getPath()).createHandler();

      if (handler) {
        handler = Preloaded({ref: 'rendered'}, handler);
      }

      return this.transferPropsTo(this.props.component(null, handler));
    }
};

var Locations = React.createClass({

  mixins: [RouterMixin],

  displayName: 'Locations',

  getDefaultProps: function() {
    return {component: React.DOM.div};
  }
});

var Pages = React.createClass({

  mixins: [RouterMixin],

  displayName: 'Pages',

  getDefaultProps: function() {
    return {component: React.DOM.body};
  }
});

module.exports = {
  Locations: Locations,
  Pages: Pages
}
