"use strict";

var React       = require('react');
var Environment = require('./environment');


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

  /**
   * @private
   */
  _getNavigable: function() {
    return this.context.router || Environment.defaultEnvironment;
  },

  getPath: function() {
    return this._getNavigable().getPath();
  },

  navigate: function(path, cb) {
    return this._getNavigable().navigate(path, cb);
  },

  getAbsolutePath: function(path) {
    return this._getNavigable().getAbsolutePath(path);
  }
};

module.exports = NavigatableMixin;
