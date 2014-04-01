"use strict";

var React                   = require('react');
var merge                   = require('react/lib/merge');
var WaitForAsync            = require('./WaitForAsync');
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
      return matchRoutes(this.props.children, path);
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
        handler = WaitForAsync({ref: 'rendered'}, handler);
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
