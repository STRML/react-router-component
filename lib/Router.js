"use strict";

var React                   = require('react');
var merge                   = require('react/lib/merge');
var Preloaded               = require('react-async/lib/Preloaded');
var RoutingEnvironmentMixin = require('./RoutingEnvironmentMixin');
var matchRoutes             = require('./matchRoutes');

var RouterMixin = {

    mixins: [RoutingEnvironmentMixin],

    propTypes: {
      onPathChange: React.PropTypes.func,
      onBeforeNavigation: React.PropTypes.func,
      onNavigation: React.PropTypes.func
    },

    getInitialState: function() {
      return {navigation: {}};
    },

    match: function(path) {
      path = path || this.getPath();
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

    onNavigation: function(path, navigation, cb) {
      if (this.props.onPathChange) {
        this.props.onPathChange(path, navigation);
      }

      navigation = merge(navigation, {match: this.match()});

      if (this.props.onBeforeNavigation &&
          this.props.onBeforeNavigation(path, navigation) === false) {
        return;
      }

      if (navigation.onBeforeNavigation &&
          navigation.onBeforeNavigation(path, navigation) === false) {
        return;
      }

      this.setState({navigation: navigation}, function() {
        if (this.props.onNavigation) {
          this.props.onNavigation(path, navigation);
        }

        cb();
      }.bind(this));
    },

    render: function() {
      var handler = this.match().createHandler();

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
