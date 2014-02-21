# Server side rendering

React have [`renderComponentToString`][render-component-to-string] function
which allows to render React components outside of a browser. That means that
you can use it to pre-render your UI on server.

React router components support this use case out of the box. The only thing you
need is to pass a `path` prop to a router so it can determine which location to
render without accessing `window.location.pathname` (which isn't available on
server):

    var App = React.createClass({

      render: function() {
        return (
          <Locations path={this.props.path}>
            <Location path="/" handler={MainPage} />
            <Location path="/users/:username" handler={UserPage} />
          </Locations>
        )
      }
    })

Then to get the markup:

    var app = App({path: '/users/andreypopp')
    var markup = React.renderComponentToString(app)

## Express middleware

You probably would want to use it in your [express][] application. Then the
needed middleware would look like:

    var url        = require('url')

    function(req, res, next) {
      try {
        var path = url.parse(req.url).pathname
        var app = App({path: path})
        var markup = React.renderComponentToString(app)
        res.send(markup)
      } catch(err) {
        return next(err)
      }
    }

## Full page rendering

React supports rendering directly into `document` element when using server side
rendering.

That means that you can generate entire page's markup with `<html>`, `<head>`
and so on.

React router component provides an another router `Pages`. It is completely
similar to `Locations` but renders directly into `<body>` DOM element.

    var Router = require('react-router-component')
    var Pages = Router.Pages
    var Page = Router.Page

    var App = React.createClass({

      render: function() {
        return (
          <html>
            <head>
              <script src="/bundle.js"></script>
            </head>
            <Pages path={this.props.path}>
              <Page path="/" handler={MainPage} />
              <Page path="/users/:username" handler={UserPage} />
            </Pages>
          </html>
        )
      }
    })

There is also `Page` route descriptor which is just an alias for `Location`. It
is provided for convenience.

[render-component-to-string]: http://facebook.github.io/react/docs/top-level-api.html#react.rendercomponenttostring
[express]: http://expressjs.com
