# A custom Router component

You can define your own Router component.

This might be useful if you like to have a more traditional routing approach in
where you define routes as component's class attribute:

    routes: {
      '/': MainPage,
      ...
    }

Another case for this is to have more control how routers render its children,
you can define your own `render()` and do what you want.

We are going to implement custom router as a mixin:

    var React = require('react')
    var Router = require('react-router-component')

    var MyRouterMixin = {
      mixins: [Router.RouterMixin],

      getRoutes: function() {
        var routes = []
        for (var path in this.routes)
          routes.push({path: path, handler: this.routes[path]})
        return routes
      },

      renderRouterHandler: function() {
        return this.transferPropsTo(this.state.match.getHandler())
      }
    }

Then we can use it like this:

    var Application = React.createClass({
      mixins: [MyRouterMixin],

      routes: {
        '/': MainPage,
        '/users/:username': UserPage,

        null: NotFoundPage
      },

      render: function() {
        return this.renderRouterHandler()
      }
    });
