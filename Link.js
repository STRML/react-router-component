"use strict";

var React             = require('react');
var NavigatableMixin  = require('./NavigatableMixin');

/**
 * A basic navigatable component which renders into <a> DOM element and handles
 * onClick event by transitioning onto different route (defined by
 * this.props.href).
 */
var Link = React.createClass({
  mixins: [NavigatableMixin],

  displayName: 'Link',

  propTypes: {
    href: React.PropTypes.string.isRequired
  },

  onClick: function(e) {
    e.preventDefault();
    this.navigate(this.props.href);
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  },

  render: function() {
    var router = this.getRouter();
    var props = {
      onClick: this.onClick,
      href: router ? router.makeHref(this.props.href) : this.props.href
    };
    return this.transferPropsTo(React.DOM.a(props, this.props.children));
  }
});

module.exports = Link;
