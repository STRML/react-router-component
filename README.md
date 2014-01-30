# react-router

Declarative router component for [React][react]:

    module React from 'react';
    import {Pages, Page} from 'react-router';

    module.exports = React.createClass({
      render: function() {
        return (
          <html>
            <head>
              <script src="/bundle.js"></script>
            </head>
            <Pages location={this.props.location}>
              <Page path="/">
                <div>Main page</div>
              </Page>
              <Page path="/users/:username">
                <div>Some user page</div>
              </Page>
              <NotFound>
                Sorry, 404!
              </NotFound>
            </Pages>
          </html>
        );
      }
    });

[react]: https://facebook.github.io/react
