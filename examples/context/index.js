"use strict";

var React     = require('react');
var CreateReactClass = require('create-react-class');
var Router    = require('../../');

var Locations = Router.Locations;
var Location  = Router.Location;
var Link      = Router.Link;


var Context = {
  mixins: [Router.RouterMixin],

  getDefaultProps: function() {
    return {contextual: true};
  },

  getRoutes: function() {
    return [{path: '*', handler: null}];
  }
};


var Tabs = CreateReactClass({

  mixins: [Context],

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

var Tab1 = CreateReactClass({

  render: function() {
    return <div>Tab1</div>;
  }
});

var Tab2 = CreateReactClass({

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

React.render(app, document.getElementById('host'));
