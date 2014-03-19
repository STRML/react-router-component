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
    global: React.PropTypes.bool,
    globalHash: React.PropTypes.bool
  },

  onClick: function(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
    if (!e.defaultPrevented) {
      e.preventDefault();
      this._navigate(this.props.href, function(err) {
        if (err) {
          throw err;
        }
      });
    }
  },

  _navigationParams: function() {
    var params = {};
    for (var k in this.props) {
      if (!this.constructor.propTypes[k]) {
        params[k] = this.props[k];
      }
    }
    return params;
  },

  _createHref: function() {
    return this.props.global ?
      Environment.defaultEnvironment.makeHref(this.props.href) :
      this.makeHref(this.props.href);
  },

  _navigate: function(path, cb) {
    if (this.props.globalHash) {
      return Environment.hashEnvironment.navigate(path, cb);
    }

    if (this.props.global) {
      return Environment.defaultEnvironment.navigate(path, cb);
    }

    return this.navigate(path, this._navigationParams(), cb);
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
