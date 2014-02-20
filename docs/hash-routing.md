# "Hash" routing

Older browser which don't support [History API][] can use another kind of router
which routes based on `window.location.hash` instead of `pathname`.

That means that you don't get nice URLs when transitioning from a location to
another location but everything else will be working as expected.

To use "hash" router you just need to use another set of components under `Hash`
namespace:

    var React = require('react')
    var Router = require('react-router-component')

    var Locations = Router.Hash.Locations
    var Location = Router.Hash.Location

Everything else is the same:

    var App = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainPage} />
            <Location path="/users/:username" handler={UserPage} />
          </Locations>
        )
      }
    })

Another use case for "hash" router is when you are not using a web server to
prototype your application and everything is served directly from filesystem.

[History API]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
