/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var ReactRouter = require('../../');
var Locations = ReactRouter.Locations;
var Location = ReactRouter.Location;
var Link = ReactRouter.Link;

var Master = React.createClass({

  render: function() {
    var links = [1, 2, 3, 4, 5].map((item) =>
      <li>
        <Link href={`/${item}`}>Item {item}</Link>
      </li>
    );
    return <ul>{links}</ul>;
  }
});

var Detail = React.createClass({

  render: function() {
    return (
      <div>
        <p>Detailed info for item: {this.props.item}</p>
      </div>
    );
  }
});

var Page = React.createClass({

  render: function() {
    return (
      <div>
        <Master />
        {this.props.item && <Detail item={this.props.item} />}
      </div>
    );
  }
});

var App = React.createClass({

  render: function() {
    return (
      <div>
        <h1>Master-detail with react-router-component</h1>
        <Locations hash>
          <Location path="/" handler={Page} />
          <Location path="/:item" handler={Page} />
        </Locations>
      </div>
    );
  }
});

React.render(App(), document.getElementById('host'));
