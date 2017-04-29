# Querystring parsing

React-router-component, as of 0.28.0, understands querystrings.

Querystrings are not matched as part of a route. It is not possible to switch routes
based on a querystring.

The route `/foo/:bar` will match both `/foo/biff` and `/foo/baz?biff=baz&num=1`.

For example:

    var CreateReactClass = require('create-react-class');
    var PropTypes = require('prop-types');

    var App = CreateReactClass({

      render: function() {
        return (<Locations path={this.props.path)}
              onBeforeNavigation={this.showProgressBar}
              onNavigation={this.hideProgressBar}>
            <Location path="/foo/:bar" handler={QueryPage} />
          </Locations>
        );
      }
    });

    var QueryPage = CreateReactClass({
      propTypes: {
        bar: propTypes.string,
        _query: propTypes.object
      },

      render: function() {
        return (
          <div>
            Hello, this is main page of the application!
            This component was passed the values:
            Bar: <b>{this.props.bar}</b>
            Query: <b>{JSON.stringify(this.props._query)}</b>
          </div>
        )
      }
    })

    React.render(<App path="/foo/bar?baz=biff&num=1&react=isAwesome" />);
