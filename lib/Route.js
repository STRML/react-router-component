"use strict";

var React = require('react');

function createClass(name) {
  return React.createClass({
    displayName: name,
    propTypes: {
      handler: React.PropTypes.oneOfType([
        // Can be ReactElement or ReactComponent, unfortunately there is no way to typecheck
        // ReactComponent (that I know of)
        React.PropTypes.element,
        React.PropTypes.func
      ]),
      path: name === 'NotFound' ?
        function(props, propName) {
          if (props[propName]) throw new Error("Don't pass a `path` to NotFound.");
        }
        : React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.instanceOf(RegExp)
          ]).isRequired,
      urlPatternOptions: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.string),
        React.PropTypes.object
      ])
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
