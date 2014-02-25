# Hash routing

Older browser which don't support [History API][] (notably IE < 10) can use hash
router instead.

Hash router dispatches to locations based on `location.hash` instead of
`location.pathname`.

That means you don't get nice URLs when transitioning from a location to another
location but everything else will be working as expected.

To use hash routing you need to pass a `hash` prop to a router:

    var App = React.createClass({

      render: function() {
        return (
          <Locations hash>
            <Location path="/" handler={MainPage} />
            <Location path="/users/:username" handler={UserPage} />
          </Locations>
        )
      }
    })

Another use case for hash routers is when you are not using a web server to
prototype your application and everything is served directly from filesystem.

[History API]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
