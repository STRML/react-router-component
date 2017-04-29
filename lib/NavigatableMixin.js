"use strict";

var React       = require('react');
var PropTypes   = require('prop-types');
var Environment = require('./environment');


/**
 * NavigatableMixin
 *
 * A mixin for a component which operates in context of a router and can
 * navigate to a different route using `navigate(path, navigation, cb)` method.
 */
var NavigatableMixin = {

  contextTypes: {
    router: PropTypes.any
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

  navigate: function(path, navigation, cb) {
    return this._getNavigable().navigate(path, navigation, cb);
  },

  makeHref: function(path) {
    return this._getNavigable().makeHref(path);
  }
};

module.exports = NavigatableMixin;
