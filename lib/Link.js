"use strict";

var React             = require('react');
var NavigatableMixin  = require('./NavigatableMixin');
var Environment       = require('./Environment');

/**
 * Link.
 *
 * A basic navigatable component which renders into <a> DOM element and handles
 * onClick event by transitioning onto different route (defined by
 * this.props.href).
 */
var Link = React.createClass({
  mixins: [NavigatableMixin],

  displayName: 'Link',

  propTypes: {
    href: React.PropTypes.string.isRequired,
    global: React.PropTypes.bool
  },

  onClick: function(e) {
    e.preventDefault();
    this._navigate(this.props.href, function(err) {
      if (err) {
        throw err;
      }
    });
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  },

  _createHref: function() {
    return this.props.global ?
      Environment.defaultEnvironment.makeHref(this.props.href) :
      this.makeHref(this.props.href);
  },

  _navigate: function(path, cb) {
    return this.props.global ?
      Environment.defaultEnvironment.navigate(path, cb) :
      this.navigate(path, cb);
  },

  render: function() {
    var props = {
      onClick: this.onClick,
      href: this._createHref()
    };
    return this.transferPropsTo(React.DOM.a(props, this.props.children));
  }
});

module.exports = Link;
