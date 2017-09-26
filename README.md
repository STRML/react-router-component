# React Router Component

[![TravisCI Build Status](https://travis-ci.org/STRML/react-router-component.svg?branch=master)](https://travis-ci.org/STRML/react-router-component)


|Version        | Compatibility|
|---------------|--------------|
|>= 0.39.0      | React v15,16 |
|>= 0.32.0      | React v15    |
|>= 0.27.0      | React 0.14   |
|0.24 - 0.26.0  | React 0.13   |
|0.23 - 0.26.0  | React 0.12   |
|0.20 - 0.22.2  | React 0.11   |
|< 0.20         | React 0.10   |

React router component allows you to define routes in your [React][] application
in a declarative manner, directly as a part of your component hierarchy.

## Project Overview

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
`location.hash` if browser doesn't support History API (see [hash routing][hash-routing]).

Props can be passed through the router by setting them directly on each `<Location>`, or to all possible routes
via a `childProps` hash.

Furthermore it provides advanced features like support for [regex matching][regex],
[full page server side rendering][server-side], [multiple routers][multiple] on the same page,
[querystring parsing][querystring], and [contextual routers][contextual].

Its functionality is tested using [Saucelabs][] on all modern browsers (IE >= 9,
Chrome >= 27, Firefox >= 25, Safari >= 6 and Mobile Safari on iPhone and iPad >=
6).

Its size is about 3.5kb gzipped.

## Installation

React router component is packaged on npm:

    % npm install react-router-component

## Docs

* [Overview and Usage][docs]
* [Implementation Visualization][implementation]
* [Hash Routing][hash-routing]
* [Parsing Query Strings][querystring]
* [Server-side Rendering][server-side]
* [Multiple Routers][multiple]
* [Contextual Routers][contextual]
* [Capturing Clicks on Anchor Elements][a-elements]
* [A custom Link Component][rec-custom-link]
* [A custom Router Component][rec-custom-router]
* [An Animated Router Component with ES6][rec-es6-custom-router]
* [Overriding URL-Pattern's Compiler][override-url-pattern]

[hash-routing]: http://strml.viewdocs.io/react-router-component/hash-routing
[regex]: http://strml.viewdocs.io/react-router-component#user-content-regular-expressions
[server-side]: http://strml.viewdocs.io/react-router-component/server-side
[multiple]: http://strml.viewdocs.io/react-router-component/multiple
[contextual]: http://strml.viewdocs.io/react-router-component/contextual
[querystring]: http://strml.viewdocs.io/react-router-component/querystring
[a-elements]: http://strml.viewdocs.io/react-router-component/a-elements
[rec-custom-link]: http://strml.viewdocs.io/react-router-component/recipes/custom-link
[rec-custom-router]: http://strml.viewdocs.io/react-router-component/recipes/custom-router
[rec-es6-custom-router]: http://strml.viewdocs.io/react-router-component/recipes/es6-custom-router
[override-url-pattern]: http://strml.viewdocs.io/react-router-component/override-url-pattern
[implementation]: http://strml.viewdocs.io/react-router-component/implementation

[docs]: http://strml.viewdocs.io/react-router-component
[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[React-Shims]: http://facebook.github.io/react/docs/working-with-the-browser.html#polyfills-needed-to-support-older-browsers
[Saucelabs]: https://saucelabs.com
