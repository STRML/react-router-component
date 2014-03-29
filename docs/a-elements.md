# Capturing `<a>` clicks

The normal way of exposing navigation between your different routes is to use
the `Link` component. However, sometimes you need to connect a third-party
component, or even embed raw HTML (e.g. from a CMS) that contain plain old `<a>`
elements. In those cases, using `Link` isn't an option, but don't worry! React
router component provides a way to capture the click events from `<a>` elements
and handle them with the router.

Just wrap these sections with a `CaptureClicks` component:

    var React = require('react')
    var Router = require('react-router-component')
    var Locations = Router.Locations
    var Location = Router.Location
    var CaptureClicks = require('react-router-component/lib/CaptureClicks')

    var Page = React.createClass({
      render: function() {
        return (
          <div>
            <ThirdPartyComponentWithAElements />
            <div dangerouslySetInnerHTML={
              {__html: '<a href="/message">Click me!</a>'}
            } />
          </div>
        )
      }
    })

    var App = React.createClass({
      render: function() {
        return (
          <CaptureClicks>
            <Locations>
              <Location path="/" handler={Page} />
              <Location path="/message" handler={OtherPage} />
            </Locations>
          </CaptureClicks>
        )
      }
    })

The `CaptureClicks` component will now hear clicks on all nested `<a>` elements
and, if they correspond to a routed path, let the router handle them. Any
elements with `hrefs` that aren't routed will retain their default behavior.
