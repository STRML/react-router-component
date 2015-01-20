# React Router Component

*React-Router-Component >= 0.23 uses React 0.12. If you need React 0.11 support,*
*please use versions 0.20 through 0.22.2.*

React router component allows you to define routes in your [React][] application
in a declarative manner, directly as a part of your component hierarchy.

## Docs

* [Overview][docs]
* [Implementation Visualization][implementation]
* [Hash Routing][hash-routing]
* [Server-side Rendering][server-side]
* [Multiple Routers][multiple]
* [Contextual Routers][contextual]
* [Asynchronous Routes][async]
* [Capturing Clicks on anchor elements][a-elements]
* [A custom Link component][rec-custom-link]
* [A custom Router component][rec-custom-router]

## Project Overview

Usage is as simple as just returning a configured router component from your
component's `render()` method:

    <Locations>
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} />
      <Location path="/search/*" handler={SearchPage} />
      <Location path={/\/product\/([0-9]*)/} handler={ProductPage} />
    </Locations>

Alternatively, if you don't prefer JSX:

    Locations(null,
      Location({path: "/", handler: MainPage}),
      Location({path: "/users/:username", handler: UserPage}),
      Location({path: "/search/*", handler: SearchPage}),
      Location({path: /\/product\/([0-9]*)/, handler: ProductPage}))

Having routes defined as a part of your component hierarchy allows to
dynamically reconfigure routing based on your application state. For example you
can return a different set of allowed locations for anonymous and signed-in
users.

React router component can dispatch based on `location.pathname` or
`location.hash` if browser doesn't support History API (see [hash routing][hash-routing]).

Furthermore it provides advanced features like support for [full page server
side rendering][server-side], [multiple routers][multiple] on the same page,
[contextual routers][contextual] and support for [async components][async].

Its functionality is tested using [Saucelabs][] on all modern browsers (IE >= 9,
Chrome >= 27, Firefox >= 25, Safari >= 6 and Mobile Safari on iPhone and iPad >=
6).

Its size is about 3.5kb gzipped.

## Installation

React router component is packaged on npm:

    % npm install react-router-component

## Compatibility

Compatible with React 0.12. Older versions work with older versions of React, see the commit log.

See [docs][] for the usage.

[hash-routing]: http://strml.viewdocs.io/react-router-component/hash-routing
[server-side]: http://strml.viewdocs.io/react-router-component/server-side
[multiple]: http://strml.viewdocs.io/react-router-component/multiple
[contextual]: http://strml.viewdocs.io/react-router-component/contextual
[a-elements]: http://strml.viewdocs.io/react-router-component/a-elements
[rec-custom-link]: http://strml.viewdocs.io/react-router-component/recipes/custom-link
[rec-custom-router]: http://strml.viewdocs.io/react-router-component/recipes/custom-router
[async]: http://strml.viewdocs.io/react-router-component/async
[implementation]: http://strml.viewdocs.io/react-router-component/implementation

[docs]: http://strml.viewdocs.io/react-router-component
[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[React-Shims]: http://facebook.github.io/react/docs/working-with-the-browser.html#polyfills-needed-to-support-older-browsers
[Saucelabs]: https://saucelabs.com
