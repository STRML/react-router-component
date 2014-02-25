"use strict";

var React       = require('react');
var invariant   = require('react/lib/invariant');
var Environment = require('./Environment');

/**
 * NavigatableMixin
 *
 * A mixin for a component which operates in context of a router and can
 * navigate to a different route using `navigate(path, cb)` method.
 */
var NavigatableMixin = {

  contextTypes: {
    router: React.PropTypes.component,
  },

  getRouter: function() {
    return this.context.router || Environment.defaultEnvironment.getRouter();
  },

  navigate: function(path, cb) {
    var router = this.getRouter();
    invariant(
      router,
      this.displayName + " can't find an active router on a page"
    );
    return router.navigate(path, cb);
  }
};

module.exports = NavigatableMixin;
