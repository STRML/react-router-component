# Contextual routers

Contextual router is a router which can be mounted under another router. Such
router is not aware of the global `location.pathname` and routes only the
unmatched part of the parent router.

    var App = React.createClass({

      render: function() {
        return (
          <Locations>
            <Location path="/" handler={MainPage} />
            <Location path="/photos/*" handler={Photos} />
          </Locations>
        )
      }
    })

    var Photos = React.createClass({

      render: function() {
        return (
          <Locations contextual>
            <Location path="/" handler={AlbumPage} />
            <Location path="/:slug" handler={PhotoPage} />
          </Locations>
        )
      }
    })
