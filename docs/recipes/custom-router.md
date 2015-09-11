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
      mixins: [Router.RouterMixin, Router.RouteRenderingMixin],

      getRoutes: function(props) {
        var routes = []
        for (var path in this.routes)
          routes.push({path: path, handler: this.routes[path]})
        return routes
      },

      setRoutingState: function(state) {
        // contains match, matchProps, handler, prefix, navigation;
        // see RouterMixin
        this.setState(state);
      }
    }

There are two things you need to notice.

First, `Router.RouterMixin` implements routing machinery and triggers router's
update when something changes (hash, pathname or something else, depending on
the environment router works in).

This mixin expects that you would implement `getRoutes` method which should
return a list of route descriptions in form of `{path: ..., handler: ...}`.

`RouterMixin` also supports intercepting its use of `setState` via `setRoutingState`.

Second, `Router.RouteRenderingMixin` is a strategy which specifies how
handler is rendered. It provides a method `renderRouteHandler()`.

We can now define our custom routers like this:

    var Application = React.createClass({
      mixins: [MyRouterMixin],

      routes: {
        '/': MainPage,
        '/users/:username': UserPage,

        null: NotFoundPage
      },

      render: function() {
        return this.transferPropsTo(this.renderRouteHandler());
      }
    });
