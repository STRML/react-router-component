"use strict";

var React = require('react');

//! FIXME how do you typecheck a React Component (not an Element)?
function isComponent(props, propName) {
  if (!React.isValidElement(React.createElement(props[propName]))) {
    throw new Error("Expected an element type or component.");
  }
}

function createClass(name) {
  return React.createClass({
    displayName: name,
    propTypes: {
      handler: React.PropTypes.oneOfType([
        React.PropTypes.element,
        isComponent
      ]),
      path: name === 'NotFound' ?
        function(props, propName) {
          if (props[propName]) throw new Error("Don't pass a `path` to NotFound.");
        }
        : React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.instanceOf(RegExp)
          ]).isRequired
    },
    getDefaultProps: function() {
      if (name === 'NotFound') {
        return {path: null};
      }
      return {};
    },
    render: function() {
      throw new Error(name + " is not meant to be directly rendered.");
    }
  });
}

module.exports = {
  /**
   * Regular route descriptor.
   *
   * @param {Object} spec
   */
  Route: createClass('Route'),
  /**
   * Catch all route descriptor.
   *
   * @param {Object} spec
   */
  NotFound: createClass('NotFound')
};
