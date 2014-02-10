# react-router-component

Declarative router component for [React][react] with support for HTML5 History
API.

## Installation

Install via npm:

    % npm install react-router-component

## Usage

Library provides a component named `Locations` and two types of location
descriptors — `Location` and `NotFound`.

    var React   = require('react')
    var Router  = require('react-router-component')

    var Locations = Router.Locations
    var Location  = Router.Location

    var MainPage = React.createClass(...)
    var UserPage = React.createClass(...)
    var NotFoundPage = React.createClass(...)

    var App = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainPage} />
            <Location path="/users/:username" handler={UserPage} />
            <NotFound handler={NotFoundPage} />
          </Locations>
        )
      }
    })

That way `App` will render a markup for a currently active location (via
`window.location.pathname`).

It automatically handles `popstate` event and updates its state accordingly.

To navigate to a different location, component exposes `navigate(path)` method.
You would want to keep a `ref` to the component to call it:

    onClick: function(e) {
      if (e.target.tagName === 'A' && e.target.attributes.href) {
        e.preventDefault();
        this.refs.router.navigate(e.target.attributes.href.value);
      }
    },

    render: function() {
      return (
        <Locations onClick={this.onClick} ref="router">
          ...
        </Locations>
      )
    }

That way all clicks to anchors will be intercepted and, instead of reloading the
page, routed via `Locations` component.

## Usage with server side rendering

You can use `react-router-component` on server. To make it render the initial
markup for a specified `path`, you just pass it via `path` prop:

    <Locations path={req.path}>
      ...
    </Locations>

## Usage with full page rendering

When using full page rendering with React you might want to avoid an additional
`<div />` component created by `Locations`. For that there's `Pages` router
component which is completely similar to `Locations` but emits `<body />`. Also
there's `Page` descriptor which is an alias for `Location` for convenience.

    <html>
      <head>
        ...
      </head>
      <Pages>
        <Page>
          ...
        </Page>
        ...
      </Pages>
    </html>

[react]: https://facebook.github.io/react
