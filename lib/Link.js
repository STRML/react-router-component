"use strict";

var React             = require('react');
var NavigatableMixin  = require('./NavigatableMixin');

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
    activeClass: React.PropTypes.string
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
    var active = router && this.props.activeClass && router.isPathActive(this.props.href);
    var props = {
      onClick: this.onClick,
      className: active ? this.props.activeClass : '',
      href: router ? router.makeHref(this.props.href) : this.props.href
    };
    return this.transferPropsTo(React.DOM.a(props, this.props.children));
  }
});

module.exports = Link;
