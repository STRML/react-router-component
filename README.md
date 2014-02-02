# react-router-component

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
                {function(state, props) { return [<div>Main page</div>]; }}
              </Page>
              <Page path="/users/:username">
                {function(state, props) { return [<div>{props.username}'s page</div>]; }}
              </Page>
              <NotFound>
                {function(state, props) { return [<div>404!</div>]; }}
              </NotFound>
            </Pages>
          </html>
        );
      }
    });

## Using with JSXX

If you are using [jsxx][jsxx]:

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
                <template>
                  <div>Main page</div>
                </template>
              </Page>
              <Page path="/users/:username">
                <template>
                  <div>{props.username}'s page</div>
                </template>
              </Page>
              <NotFound>
                <template>
                  <div>404!</div>
                </template>
              </NotFound>
            </Pages>
          </html>
        );
      }
    });

[react]: https://facebook.github.io/react
[jsxx]: https://github.com/andreypopp/jsxx
