'use strict';
import assert from 'node:assert/strict';
import React from 'react';
import renderer from 'react-test-renderer';
import {Link, Locations, Location} from '../../';

describe('Link', function() {

  describe('rendering', function() {
    it('renders an anchor element', function() {
      const component = renderer.create(
        <Locations path="/">
          <Location path="/" handler={<Link href="/test">Click me</Link>} />
        </Locations>
      );
      const tree = component.toJSON();
      // The link should be inside the router's div
      assert(tree.children);
      const link = tree.children[0];
      assert.strictEqual(link.type, 'a');
      assert.strictEqual(link.props.href, '/test');
      assert.deepEqual(link.children, ['Click me']);
    });

    it('passes through additional props to anchor', function() {
      const component = renderer.create(
        <Locations path="/">
          <Location path="/" handler={
            <Link href="/test" className="my-link" data-testid="nav-link">
              Link
            </Link>
          } />
        </Locations>
      );
      const tree = component.toJSON();
      const link = tree.children[0];
      assert.strictEqual(link.props.className, 'my-link');
      assert.strictEqual(link.props['data-testid'], 'nav-link');
    });
  });

  describe('href creation', function() {
    it('creates scoped href in contextual router', function() {
      const component = renderer.create(
        <Locations path="/parent/child">
          <Location path="/parent/*" handler={
            <Locations contextual>
              <Location path="/child" handler={<Link href="/sibling">Go</Link>} />
            </Locations>
          } />
        </Locations>
      );
      const tree = component.toJSON();
      // Find the innermost link - traverse the tree
      let node = tree;
      while (node && node.type !== 'a') {
        if (Array.isArray(node.children)) {
          node = node.children[0];
        } else if (node.children) {
          node = node.children;
        } else {
          break;
        }
      }
      // In contextual router, href should be scoped to /parent/sibling
      assert.strictEqual(node.props.href, '/parent/sibling');
    });

    it('creates absolute href when global=true', function() {
      const component = renderer.create(
        <Locations path="/parent/child">
          <Location path="/parent/*" handler={
            <Locations contextual>
              <Location path="/child" handler={<Link global href="/absolute">Go</Link>} />
            </Locations>
          } />
        </Locations>
      );
      const tree = component.toJSON();
      // Find the innermost link
      let node = tree;
      while (node && node.type !== 'a') {
        if (Array.isArray(node.children)) {
          node = node.children[0];
        } else if (node.children) {
          node = node.children;
        } else {
          break;
        }
      }
      // Global links should have the absolute href
      assert.strictEqual(node.props.href, '/absolute');
    });
  });

  describe('propTypes', function() {
    it('requires href prop', function() {
      const consoleError = console.error;
      let errorMessage = null;
      console.error = function(msg) { errorMessage = msg; };

      try {
        React.createElement(Link, {});
        assert(errorMessage && errorMessage.includes('href'));
      } finally {
        console.error = consoleError;
      }
    });
  });
});
