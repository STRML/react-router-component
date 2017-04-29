"use strict";

var React             = require('react');
var CreateReactClass  = require('create-react-class');
var PropTypes         = require('prop-types');
var NavigatableMixin  = require('./NavigatableMixin');
var Environment       = require('./environment');
var assign            = Object.assign || require('object-assign');
var omit              = require('object.omit');

/**
 * Link.
 *
 * A basic navigatable component which renders into <a> DOM element and handles
 * onClick event by transitioning onto different route (defined by
 * this.props.href).
 */
var Link = CreateReactClass({
  mixins: [NavigatableMixin],

  displayName: 'Link',

  propTypes: {
    href: PropTypes.string.isRequired,
    global: PropTypes.bool,
    globalHash: PropTypes.bool
  },

  onClick: function(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }

    // return if the link target is external
    if (this.props.href.match(/^([a-z-]+:|\/\/)/)) return;

    // return if the user did a middle-click, right-click, or used a modifier
    // key (like ctrl-click, meta-click, shift-click, etc.)
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

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
    var props = assign({}, this.props, {
      onClick: this.onClick,
      href: this._createHref()
    });
    props = omit(props, ['global', 'globalHash', '_query']);
    return React.createElement('a', props, this.props.children);
  }
});

module.exports = Link;
