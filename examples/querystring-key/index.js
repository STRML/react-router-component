/**
 * @jsx React.DOM
 */
"use strict";

var qs          = require('querystring');
var React       = require('react');
var Router      = require('../../');
var Environment = require('../../lib/Environment');

var Locations = Router.Locations;
var Location  = Router.Location;
var Link      = Router.Link;


function QueryStringKeyEnvironment(key) {
  this.key = key;
  Environment.HashEnvironment.call(this);
}

QueryStringKeyEnvironment.prototype = Object.create(Environment.HashEnvironment.prototype);
QueryStringKeyEnvironment.prototype.constructor = QueryStringKeyEnvironment;

QueryStringKeyEnvironment.prototype.getPath = function() {
  var path = Environment.HashEnvironment.prototype.getPath.call(this);
  if (path.indexOf('?') === -1) {
    return '/';
  }
  var query = qs.parse(path.split('?')[1] || '');
  return query[this.key] ? '/' + query[this.key] : '/';
};

QueryStringKeyEnvironment.prototype.pushState = function(path, navigation) {
  path = this.updatedPath(path);
  Environment.HashEnvironment.prototype.pushState.call(this, path, navigation);
}

QueryStringKeyEnvironment.prototype.replaceState = function(path, navigation) {
  path = this.updatedPath(path);
  Environment.HashEnvironment.prototype.replaceState.call(this, path, navigation);
}

QueryStringKeyEnvironment.prototype.updatedPath = function(value) {
  var path = Environment.HashEnvironment.prototype.getPath.call(this);
  if (path.indexOf('?') === -1) {
    var query = {};
    query[this.key] = value.slice(1);
    return '/?' + qs.stringify(query);
  } else {
    var splitted = path.split('?');
    var query = qs.parse(splitted[1] || '');
    query[this.key] = value.slice(1);
    return splitted[0] + '?' + qs.stringify(query);
  }
}

var Context = {
  mixins: [Router.RouterMixin],

  getDefaultProps: function() {
    return {
      contextual: true,
    };
  },

  getRoutes: function() {
    return [{path: '*', handler: null}];
  }
};

var Tabs = React.createClass({

  mixins: [Context],

  getDefaultProps: function() {
    return {
      environment: new QueryStringKeyEnvironment(this.props.routeBy || 'tab')
    }
  },

  render: function() {
    var links = [];
    var locations = [];

    this.props.tabs.forEach((tab, idx) => {
      var href = '/' + (tab.id || idx);

      links.push(Link({key: href, href: href}, tab.name));
      locations.push(Location({path: href, handler: tab.handler}));
    });

    return (
      <div>
        <div className="nav">{links}</div>
        <Locations contextual className="content">{locations}</Locations>
      </div>
    );
  }
});

var Tab1 = React.createClass({

  render: function() {
    return <div>Tab1</div>;
  }
});

var Tab2 = React.createClass({

  render: function() {
    return <div>Tab2</div>;
  }
});

var app = Tabs({
  hash: true,
  tabs: [
    {name: 'Tab 1', handler: Tab1},
    {name: 'Tab 2', handler: Tab2}
  ]
});

React.renderComponent(app, document.getElementById('host'));
