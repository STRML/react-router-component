"use strict";

var React       = require('react');
var Environment = require('./environment');
var matchRoutes   = require('./matchRoutes');

/**
 * A container component which captures <a> clicks and, if there's a matching
 * route defined, routes them.
 */
var CaptureClicks = React.createClass({
  displayName: 'CaptureClicks',

  propTypes: {
    component: React.PropTypes.func.isRequired,
    environment: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      component: React.DOM.div,
      environment: Environment.defaultEnvironment
    }
  },

  onClick: function(event) {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    // Ignore canceled events, modified clicks, and right clicks.
    if (event.defaultPrevented) { return; }
    if (event.metaKey || event.ctrlKey || event.shiftKey) { return; }
    if (event.button !== 0) { return; }

    // Get the <a> element.
    var el = event.target;
    while (el && el.nodeName !== 'A') {
      el = el.parentNode;
    }

    // Ignore clicks from non-a elements.
    if (!el) { return; }

    // Ignore the click if the element has a target.
    if (el.target && el.target !== '_self') { return; }

    // Ignore the click if it's a download link. (We use this method of
    // detecting the precense of the attribute for old IE versions.)
    if (!!el.attributes.download) { return; }

    // Ignore links that don't share a protocol and host with ours.
    if (el.protocol !== location.protocol) { return; }
    if (el.host !== location.host) { return; }

    var pathname = el.pathname;
    if (el.pathname.charAt(0) !== '/') {
      // Make sure IE has a leading slash.
      pathname = '/' + pathname;
    }

    // Try to find a matching path in available routes.
    var environment = this.props.environment;
    var match = this.findMatch(pathname, environment);
    if (match) {
      event.preventDefault();

      // Route the request.
      environment.navigate(pathname, function(err) {
        if (err) {
          throw err;
        }
      });
    }
  },

  findMatch: function(path, environment) {
    var routers = environment.routers;
    var match, router;
    for (var i = 0; i < routers.length; i++) {
      var router = routers[i];
      match = matchRoutes(router.getRoutes(router.props), path);
      if (match && match.match) {
        // TODO: Recurse into child routers to handle match.unmatchedPath
        return match;
      }
    }
  },

  render: function() {
    var props = {
      onClick: this.onClick
    };
    return this.transferPropsTo(this.props.component(props, this.props.children));
  }

});

module.exports = CaptureClicks;
