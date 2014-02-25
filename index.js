"use strict";

var React                 = require('react');
var merge                 = require('react/lib/merge');
var toArray               = require('react/lib/toArray');
var invariant             = require('react/lib/invariant');
var ExecutionEnvironment  = require('react/lib/ExecutionEnvironment');
var Environment           = require('./Environment');
var BaseRouterMixin       = require('./RouterMixin');

var pathnameRoutingEnvironment;
var hashRoutingEnvironment;
var defaultEnvironment;

if (ExecutionEnvironment.canUseDOM) {

  pathnameRoutingEnvironment = Environment.createEnvironment(
        Environment.PathnameRoutingMethod);

  hashRoutingEnvironment = Environment.createEnvironment(
        Environment.HashRoutingMethod);

  defaultEnvironment = (window.history === undefined) ?
    hashRoutingEnvironment :
    pathnameRoutingEnvironment;

} else {

  var dummyEnvironment = Environment.createEnvironment(
        Environment.DummyRoutingMethod);

  pathnameRoutingEnvironment = dummyEnvironment;
  hashRoutingEnvironment = dummyEnvironment;
  defaultEnvironment = dummyEnvironment;

}

/**
 * Mixin for a router bound to an environment
 */
var RouterMixin = {
  mixins: [Environment.Mixin, BaseRouterMixin],

  getDefaultProps: function() {
    return {
      environment: this.props.hash ? hashRoutingEnvironment : defaultEnvironment,
      component: React.DOM.div
    };
  },
};

var Router = React.createClass({
  displayName: 'Router',

  mixins: [RouterMixin],

  render: function() {
    var children = this.state.match.getChildren();
    return this.transferPropsTo(this.props.component(null, children));
  }
});

function withProps(componentConstructor, predefinedProps) {
  return function(props) {
    var children = toArray(arguments).slice(1);
    return componentConstructor(merge(predefinedProps, props), children);
  }
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

  getRouter: function() {
    return this.context.router || defaultEnvironment.getRouter();
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

function deprecateHashNamespace(fn) {
  return function() {
    console.warn(
      "Hash namespace is deprecated, pass `hash` prop to a regular router instead: " +
      "<Locations hash>...</Locations>"
    );
    return fn.apply(this, arguments);
  }
}

module.exports = {
  Hash: {
    Pages: deprecateHashNamespace(
      withProps(Router, {component: React.DOM.body, environment: hashRoutingEnvironment})),
    Page: deprecateHashNamespace(Route),

    Locations: deprecateHashNamespace(withProps(Router, {environment: hashRoutingEnvironment})),
    Location: deprecateHashNamespace(Route),

    NotFound: deprecateHashNamespace(NotFound),
    Link: deprecateHashNamespace(Link)
  },

  Pages: withProps(Router, {component: React.DOM.body}),
  Page: Route,

  Locations: Router,
  Location: Route,

  NotFound: NotFound,

  NavigatableMixin: NavigatableMixin,
  Link: Link,

  RouterMixin: RouterMixin,

  Environment: Environment,
  defaultEnvironment: defaultEnvironment,
  pathnameRoutingEnvironment: pathnameRoutingEnvironment,
  hashRoutingEnvironment: hashRoutingEnvironment
}
