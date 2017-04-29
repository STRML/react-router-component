"use strict";

var React            = require('react');
var CreateReactClass = require('create-react-class');
var PropTypes        = require('prop-types');

function createClass(name) {
  return CreateReactClass({
    displayName: name,
    propTypes: {
      handler: PropTypes.oneOfType([
        // Can be ReactElement or ReactComponent, unfortunately there is no way to typecheck
        // ReactComponent (that I know of)
        PropTypes.element,
        PropTypes.func
      ]),
      path: name === 'NotFound' ?
        function(props, propName) {
          if (props[propName]) throw new Error("Don't pass a `path` to NotFound.");
        }
        : PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(RegExp)
          ]).isRequired,
      urlPatternOptions: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object
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
