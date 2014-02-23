"use strict";

var pattern               = require('url-pattern');
var React                 = require('react');
var merge                 = require('react/lib/merge');
var invariant             = require('react/lib/invariant');
var ExecutionEnvironment  = require('react/lib/ExecutionEnvironment');
var Environment           = require('./Environment');
var RouterMixin           = require('./RouterMixin');

var defaultEnvironment;

if (ExecutionEnvironment.canUseDOM) {

  var pathnameRoutingEnvironment = Environment.createEnvironment(
        Environment.PathnameRoutingMethod);

  var hashRoutingEnvironment = Environment.createEnvironment(
        Environment.HashRoutingMethod);

  defaultEnvironment = (window.history === undefined) ?
    hashRoutingEnvironment :
    pathnameRoutingEnvironment;

} else {

  defaultEnvironment = Environment.createEnvironment(
        Environment.DummyRoutingMethod);

}

function createRouter(component, environment) {

  environment = environment || defaultEnvironment;

  return React.createClass({

    displayName: 'Router',

    mixins: [Environment.Mixin(environment), RouterMixin],

    render: function() {
      return this.transferPropsTo(component(null, this.state.match.getChildren()));
    }
  });
}

/**
 * Join pathnames and normalize double slashes.
 */
function cleanProps(props) {
  props = merge({}, props);
  delete props.path;
  delete props.handler;
  return props;
}

function Route(props, handler) {
  handler = props && props.handler || handler;
  invariant(
    typeof handler === 'function',
    "Route handler should be a component or a function but got: %s", handler
  );
  return {path: props.path, handler: handler, props: cleanProps(props)};
}

function NotFound(props, handler) {
  handler = props && props.handler || handler;
  invariant(
    typeof handler === 'function',
    "NotFound handler should be a template");
  return {path: null, handler: handler, props: cleanProps(props)};
}

/**
 * A component which can navigate to a different route.
 */
var NavigatableMixin = {

  contextTypes: {
    router: React.PropTypes.component,
  },

  navigate: function(path, cb) {
    var router = this.context.router || defaultEnvironment.getRouter();

    invariant(
      router,
      this.displayName + " can't find an active router on a page"
    );

    router.navigate(path, cb);
  }
};

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
    return this.transferPropsTo(
      React.DOM.a({onClick: this.onClick}, this.props.children));
  }
});

module.exports = {
  Hash: {
    Pages: createRouter(React.DOM.body, hashRoutingEnvironment),
    Page: Route,

    Locations: createRouter(React.DOM.div, hashRoutingEnvironment),
    Location: Route,

    NotFound: NotFound,
    Link: Link
  },

  Pages: createRouter(React.DOM.body),
  Page: Route,

  Locations: createRouter(React.DOM.div),
  Location: Route,

  NotFound: NotFound,

  NavigatableMixin: NavigatableMixin,
  Link: Link
}
