# React Router Component

For React 0.12 support, see the [react-0.12](https://github.com/STRML/react-router-component/tree/react-0.12) branch. It should be stable, but please help us bugtest it.

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

Compatible with React 0.10 and 0.11. Support for 0.12 is experimental. See the [branch](https://github.com/STRML/react-router-component/tree/react-0.12).

See [docs][] for the usage.

[hash-routing]: http://strml.viewdocs.io/react-router-component/hash-routing
[server-side]: http://strml.viewdocs.io/react-router-component/server-side
[multiple]: http://strml.viewdocs.io/react-router-component/multiple
[contextual]: http://strml.viewdocs.io/react-router-component/contextual
[url-pattern]: http://strml.viewdocs.io/react-router-component/url-pattern
[async]: http://strml.viewdocs.io/react-router-component/async

[docs]: http://strml.viewdocs.io/react-router-component
[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[React-Shims]: http://facebook.github.io/react/docs/working-with-the-browser.html#polyfills-needed-to-support-older-browsers
[Saucelabs]: https://saucelabs.com
