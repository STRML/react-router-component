'use strict';
var React = require('react');
var Router = require('react-router-component');

/**
 * TitleSwitcher is an extension of Router that switches the title on render.
 * The actual function that switches the title is not implemented here, as that 
 * can be environment-specific in isomorphic apps.
 */
var TitleSwitcher = React.createClass({
  mixins: [
    Router.AsyncRouteRenderingMixin,
    Router.RouterMixin,
    React.addons.PureRenderMixin
  ],

  propTypes: {
    messages: React.PropTypes.object,
    component: React.PropTypes.node
  },

  getDefaultProps: function() {
    return {
      component: 'div',
      messages: {}
    }
  },

  getRoutes: function(props) {
    return props.children;
  },

  setTitle: function() {
    var match = this.getMatch(), pageTitle;
    var path = match.route.props.path;
    if (path) {
      if (typeof path !== "string") {
        path = match.matchedPath;
      }
      // Assuming a messages object here. Can be used to change simple paths like '/account' into
      // "My Account", and for internationalization.
      var msg = this.props.messages.titles[path];
      pageTitle = typeof msg === "function" ? msg(match.match) : msg;
    } else {
      // Route not matched
      pageTitle = '404';
    }
    // Somewhere here you may want to set the page title
    // something.setPageTitle(pageTitle)
    return pageTitle;
  },

  render: function() {
    var title = this.setTitle();
    var handler = this.renderRouteHandler();
    var Component = this.props.component || "div";
    return <Component {...this.props} data-page-title={title}>{handler}</Component>;
  }
});

module.exports = TitleSwitcher;
