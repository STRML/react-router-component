'use strict';
import assert from 'node:assert/strict';
import React from 'react';
import {Location, NotFound} from '../../';

describe('Route', function() {

  describe('Location', function() {
    it('requires a path prop', function() {
      const consoleError = console.error;
      let errorMessage = null;
      console.error = function(msg) { errorMessage = msg; };

      try {
        // Creating without path should trigger propType warning
        React.createElement(Location, {handler: <div />});
        assert(errorMessage && errorMessage.includes('path'));
      } finally {
        console.error = consoleError;
      }
    });

    it('accepts string path', function() {
      const element = React.createElement(Location, {
        path: '/test',
        handler: <div />
      });
      assert.strictEqual(element.props.path, '/test');
    });

    it('accepts regex path', function() {
      const regex = /\/test\/(\d+)/;
      const element = React.createElement(Location, {
        path: regex,
        handler: <div />
      });
      assert.strictEqual(element.props.path, regex);
    });

    it('throws when rendered directly', function() {
      const location = React.createElement(Location, {
        path: '/test',
        handler: <div />
      });

      assert.throws(function() {
        // Location's render method throws an error
        const instance = new location.type(location.props);
        instance.render();
      }, /Route is not meant to be directly rendered/);
    });
  });

  describe('NotFound', function() {
    it('throws if path prop is provided', function() {
      const consoleError = console.error;
      let errorThrown = null;
      console.error = function() {};

      try {
        const notFound = React.createElement(NotFound, {
          path: '/should-error',
          handler: <div />
        });
        // Validate props by calling propTypes directly
        const propTypes = notFound.type.propTypes;
        if (propTypes.path) {
          try {
            propTypes.path(notFound.props, 'path', 'NotFound');
          } catch (e) {
            errorThrown = e;
          }
        }
        assert(errorThrown && errorThrown.message.includes("Don't pass a `path` to NotFound"));
      } finally {
        console.error = consoleError;
      }
    });

    it('does not require a path prop (defaults to null)', function() {
      const element = React.createElement(NotFound, {
        handler: <div>not found</div>
      });
      // NotFound has getDefaultProps that sets path to null
      assert.strictEqual(element.props.path, null);
    });

    it('throws when rendered directly', function() {
      const notFound = React.createElement(NotFound, {
        handler: <div />
      });

      assert.throws(function() {
        const instance = new notFound.type(notFound.props);
        instance.render();
      }, /NotFound is not meant to be directly rendered/);
    });
  });

  describe('urlPatternOptions', function() {
    it('accepts array of strings', function() {
      const element = React.createElement(Location, {
        path: /\/test\/(\d+)\/(\w+)/,
        urlPatternOptions: ['id', 'name'],
        handler: <div />
      });
      assert.deepEqual(element.props.urlPatternOptions, ['id', 'name']);
    });

    it('accepts object', function() {
      const options = { segmentValueCharset: 'a-zA-Z0-9' };
      const element = React.createElement(Location, {
        path: '/test/:id',
        urlPatternOptions: options,
        handler: <div />
      });
      assert.deepEqual(element.props.urlPatternOptions, options);
    });
  });
});
