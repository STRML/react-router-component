# React Router Component

React router component allows you to define application routes in your [React][]
in a declarative manner, directly as a part of your component hierarchy.

To use it, you just return a configured router component from your `.render()`
function:

    <Locations>
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} />
    </Locations>

Alternatively, if you don't prefer JSX:

    Locations(
      Location({path: "/", handler: MainPage}),
      Location({path: "/users/:username", handler: UserPage}))

While having a nice API this approach allows you to dynamically reconfigure
routing based on your application state. For example you can return a different
set of allowed locations for anonymous and signed-in users.

React router component handles `"popstate"` event and makes appropriate
transitions between locations (that means back button works as expected). It
also provides a method to navigate between locations which sets the correct
`window.location` by using `window.history.pushState(..)` function.

React router component also provides advanced features like support for full
page server side rendering and nested and contextual routers.

Its functionality is tested using [Saucelabs][] on all modern browsers (IE >=
10, Chrome >= 27, Firefox >= 25, Safari >= 6 and Mobile Safari on iPhone and
iPad >= 6). Basically, the browsers which support the HTML5 History API.

## Installation

React router component is packaged on npm:

    % npm install react-router-component

See [docs][] for the usage.

[docs]: http://andreypopp.viewdocs.io/react-router-component
[React]: http://facebook.github.io/react/
[React-Refs]: http://facebook.github.io/react/docs/more-about-refs.html
[Saucelabs]: saucelabs.com
