# React Router Component

React router component allows you to define routes in your [React][] application
in a declarative manner, directly as a part of your component hierarchy.

Usage is as simple as just returning a configured router component from your
component's `render()` method:

    <Locations>
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} />
    </Locations>

Alternatively, if you don't prefer JSX:

    Locations(
      Location({path: "/", handler: MainPage}),
      Location({path: "/users/:username", handler: UserPage}))

Having routes defined as a part of your component hierarchy allows to
dynamically reconfigure routing based on your application state. For example you
can return a different set of allowed locations for anonymous and signed-in
users.

React router component can dispatch based on `location.pathname` or
`location.hash` if browser doesn't support History API.

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

See [docs][] for the usage.

[hash-routing]: http://andreypopp.viewdocs.io/react-router-component/hash-routing
[server-side]: http://andreypopp.viewdocs.io/react-router-component/server-side
[multiple]: http://andreypopp.viewdocs.io/react-router-component/multiple
[contextual]: http://andreypopp.viewdocs.io/react-router-component/contextual
[url-pattern]: http://andreypopp.viewdocs.io/react-router-component/url-pattern
[async]: http://andreypopp.viewdocs.io/react-router-component/async

[docs]: http://andreypopp.viewdocs.io/react-router-component
[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[React-Shims]: http://facebook.github.io/react/docs/working-with-the-browser.html#polyfills-needed-to-support-older-browsers
[Saucelabs]: saucelabs.com
