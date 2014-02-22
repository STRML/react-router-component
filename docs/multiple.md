# Multiple routers on the same page

You can have multiple routers active at the same time.

Define several components which use `Locations` router to dispatch to different
UI components:

    var Sidebar = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainSidebar} />
            <Location path="/users/:username" handler={UserSidebar} />
          </Locations>
        )
      }
    })

    var Content = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainContent} />
            <Location path="/users/:username" handler={UserContent} />
          </Locations>
        )
      }
    })

Then combine them into a single component:

    var App = React.createClass({

      render: function() {
        return (
          <div>
            <Sidebar />
            <Content />
          </div>
        )
      }
    })

When you navigate to a different location using `Link` component or `navigate()`
method all routers will respond to that and update its state.
