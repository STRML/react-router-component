# Create a custom Link component

We are going to create a custom Link component which would have different
appearance if the current location matches its href.

We would call a component `HighlightedLink` and implement it as a component
which wraps original `Link` component:

    var React = require('react')
    var Router = require('react-router-component')

    var HighlightedLink = React.createClass({

      mixins: [Router.NavigatableMixin],

      isActive: function() {
        return this.getPath() === this.props.href
      },

      render: function() {
        var className
        if (this.props.activeClassName && this.isActive()) {
          className = this.props.activeClassName
        }
        var link = Router.Link({className: className}, this.props.children)
        return this.transferPropsTo(link)
      }
    })

Now you can use it like `Link` component but pass it an additional
`activeClassName` prop which specifies a class name which would be applied in
case link becomes "active" (its href matches with current active location):

    <HighlightedLink href="/" activeClassName="active">
      Main page
    </HighlightedLink>

Now we only need a bit of CSS:

    a.active {
      text-decoration: none;
      color: #888;
    }
