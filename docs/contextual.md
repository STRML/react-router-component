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

Now the application would have the following routes:

  - `/` dispatches to a `MainPage`
  - `/photos/` dispatches to a `AlbumPage`
  - `/photos/:slug` dispatches to a `PhotoPage`

If you use `Link` components inside a contextual router, its `href` would be
scoped to this router. In the following example, the link *"back to albums"*
would trigger transition to `/photos/` URL.

    var PhotoPage = React.createClass({

      render: function() {
        return (
          <div>
            <img src={this.props.slug} />
            <Link href="/">back to albums</Link>
          </div>
        )
      }
    })

That allows to use contextual routers to write self-contained and reusable parts
of an application which can be mounted several times under several different
prefixes.

### Navigate outside of the router's context

Sometimes you want to navigate outside of the router's context. You can do this
with `Link` component by creating it with a `global` boolean property, if you are only using `hash` routes use the `globalHash` property:

    <Link global href="/">Home</Link>

That way `href` of a generate `<a/>` element will be equal to `'/'` (not
prefixed with contextual router's prefix).
