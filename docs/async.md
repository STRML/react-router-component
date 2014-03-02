# Routing with async components

React router component provide a special treatment for *async components* (as
defined by [react-async][]) as route handlers. Router defers its update before
the async components has its async state fetched.

This is useful when you have route handlers in your application which need to
fetch some data via XHR and you don't want to switch routes before this
happened.

Working with async components is straightforward. You should install
[react-async][] package first:

    % npm install react-async

And use `Async.Mixin` in definitions of route handlers:

    var React = require('react')
    var Router = require('react-router-component')
    var Async = require('react-async')

    var Page = React.createClass({

      mixins: [Async.Mixin],

      getInitialStateAsync: function(cb) {
        xhr.get('/api/message', cb)
      },

      render: function() {
        return <div>{this.state.message}</div>
      }
    })

    var App = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/message" handler={Page} />
            ...
          </Locations>
        )
      }
    })

[react-async]: http://andreypopp.viewdocs.io/react-async
