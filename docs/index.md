# React Router Component

##### Table of contents

* [Implementation Visualization][implementation]
* [Hash Routing][hash-routing]
* [Server-side Rendering][server-side]
* [Multiple Routers][multiple]
* [Contextual Routers][contextual]
* [Capturing Clicks on anchor elements][a-elements]
* [A custom Link component][custom-link]
* [A custom Router component][custom-router]
* [An animated Router with ES6][es6-custom-router]

React router component allows you to define routes in your [React][] application
in a declarative manner, directly as a part of your component hierarchy.

Usage is as simple as just returning a configured router component from your
component's `render()` method:

    <Locations>
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} />
      <Location path="/search/*" handler={SearchPage} />
      <Location path={/\/product\/([0-9]*)/} handler={ProductPage} />
    </Locations>

Having routes defined as a part of your component hierarchy allows to
dynamically reconfigure routing based on your application state. For example you
can return a different set of allowed locations for anonymous and signed-in
users.

React router component can dispatch based on `location.pathname` or
`location.hash` if browser doesn't support History API.

Furthermore it provides advanced features like support for [full page server
side rendering][server-side], [multiple routers][multiple] on the same page,
[querystring parsing][querystring],
[contextual routers][contextual] and
[optional handling of normal `<a>` elements][a-elements].

Its functionality is tested using [Saucelabs][] on all modern browsers (IE >= 9,
Chrome >= 27, Firefox >= 25, Safari >= 6 and Mobile Safari on iPhone and iPad >=
6).

Its size is about 3.5kb gzipped.

## Installation

React router component is packaged on npm:

    % npm install react-router-component

## Basic usage

First you require `react-router-component` library:

    var React = require('react')
    var Router = require('react-router-component')

If you are using JSX, don't forget to bring components from a library into
scope, cause JSX doesn't support namespaces yet:

    var Locations = Router.Locations
    var Location = Router.Location

Otherwise, as of React 0.12, you must create factories:

    var Locations = React.createFactory(Router.Locations)
    var Location = React.createFactory(Router.Location)

Now you can define your application as a regular React component which renders
into `Locations` router:

    var App = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainPage} />
            <Location path="/users/:username" handler={UserPage} />
            <Location path={/\/friends\/(\d+)\/(photos|wall)/} handler={FriendsPage}
              matchKeys={['id', 'pageName']} />
          </Locations>
        )
      }
    })

**Note:** See [hash routing][hash-routing] to enable `location.hash`.

Direct children of `Locations` router must be `Location` route descriptors.

Each descriptor accepts a `path` property which specifies URL pattern and a
`handler` property which declares a component which should render in case
corresponding `path` is matched.

Parameters extracted from a `path` will be passed to a `handler` as props. In
the example above, `UserPage` component will receive `username` prop on a
successful location match.

The final part is to render your `App` component which activates your router:

    React.render(React.createElement(App), document.body)

In case no location is matched router would render into an empty set of
elements.

## Regular expressions

Regular expressions are an easy way to accomplish more advanced routing.

When using a regular expression, parameters extracted from the regex will be
passed as an array with the name `_`. This may be inconvenient if your components
are reused. If you specify an array of keys and pass it as the `urlPatternOptions` prop,
matches from the regex will be translated.

For example, in the App above, the path `/friends/39/wall` would pass the props
`{id: '39', pageName: 'wall'}` to the handler, `FriendsPage`.

## Handling "404 Not Found" case

You might want to specify a fallback location which will be activated in case no
other location is matched. For that there's a special `NotFound` location
descriptor:

    var NotFound = Router.NotFound

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

## Navigating between locations

To navigate between different locations React router component provides a `Link`
component. It renders into `<a>` DOM element but handles `"click"` by activating
a different location in the router.

As an example, let's see how `MainPage` component can be implemented with the
usage of the `Link` component to transition to a `UserPage`:

    var Link = require('react-router-component').Link

    var MainPage = React.createClass({

      render: function() {
        return (
          <div>
            Hello, this is main page of the application!
            Proceed to my <Link href="/users/andreypopp">user page</Link>.
          </div>
        )
      }
    })

Alternatively, if you have a reference to a router component instance, you can
call its `.navigate(href)` method to do a transition to a different location.
You can acquire a reference to a router by using React's [Refs][React-Refs]
mechanism.

## Navigation callbacks

Routers also accept callbacks `onBeforeNavigation` and `onNavigation` as
properties which will be called before and after navigation correspondingly:

    <Locations
        onBeforeNavigation={this.showProgressBar}
        onNavigation={this.hideProgressBar}>
      <Location path="/" handler={MainPage} />
      ...
    </Locations>

## Custom / No Router Component

Routers also accept a `component` prop, so you can change the rendered parent component:

    <Locations component="section">...

You can also remove the wrapper entirely by passing a falsy value. This will render the matching
route directly without wrapping.

    <Locations component={null}>....

## Advanced usage

Advanced features include support for [full page server
side rendering][server-side], [multiple routers][multiple] on the same page and
[contextual routers][contextual].

## Recipes

These are the examples of what you can do with React Router component:

  * [Create a custom Link component][custom-link] which would have different appearance if the
    current location matches its href.

  * [A custom Router component][custom-router] which allows to declare
    routes as a prototype attribute (statically) as opposed to have routes
    inferred from its children.

  * [An Animated Router component in ES6][es6-custom-router] an animated router that allows
    the user to set transitions via ReactCSSTransitionGroup. This example also shows use of mixins
    with ES6.

[custom-link]: recipes/custom-link
[custom-router]: recipes/custom-router
[es6-custom-router]: recipes/es6-custom-router

[hash-routing]: hash-routing
[querystring]: querystring
[server-side]: server-side
[multiple]: multiple
[contextual]: contextual
[a-elements]: a-elements
[implementation]: implementation

[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[React-Shims]: http://facebook.github.io/react/docs/working-with-the-browser.html#polyfills-needed-to-support-older-browsers
[Saucelabs]: https://saucelabs.com
