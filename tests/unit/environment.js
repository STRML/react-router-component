'use strict';
import assert from 'node:assert/strict';
import environment from '../../lib/environment';

describe('environment', function() {

  describe('module exports', function() {
    it('exports defaultEnvironment', function() {
      assert(environment.defaultEnvironment);
    });

    it('exports pathnameEnvironment', function() {
      assert(environment.pathnameEnvironment);
    });

    it('exports hashEnvironment', function() {
      assert(environment.hashEnvironment);
    });

    it('exports dummyEnvironment on server', function() {
      // In Node.js (server), dummyEnvironment should be defined
      assert(environment.dummyEnvironment);
    });

    it('exports Environment base class', function() {
      // On server, these may be undefined but the exports should exist
      assert('Environment' in environment);
    });

    it('exports Mixin', function() {
      assert(environment.Mixin);
      assert(typeof environment.Mixin.componentDidMount === 'function');
      assert(typeof environment.Mixin.componentWillUnmount === 'function');
    });
  });

  describe('DummyEnvironment', function() {
    it('has getPath method', function() {
      assert(typeof environment.dummyEnvironment.getPath === 'function');
    });

    it('has setPath method', function() {
      assert(typeof environment.dummyEnvironment.setPath === 'function');
    });

    it('has makeHref method', function() {
      assert(typeof environment.dummyEnvironment.makeHref === 'function');
    });

    it('returns path from makeHref', function() {
      const href = environment.dummyEnvironment.makeHref('/test');
      assert.strictEqual(href, '/test');
    });
  });

  describe('server-side environment', function() {
    it('defaultEnvironment is dummyEnvironment on server', function() {
      // On server (Node.js without DOM), these should be the same
      assert.strictEqual(environment.defaultEnvironment, environment.dummyEnvironment);
    });

    it('pathnameEnvironment is dummyEnvironment on server', function() {
      assert.strictEqual(environment.pathnameEnvironment, environment.dummyEnvironment);
    });

    it('hashEnvironment is dummyEnvironment on server', function() {
      assert.strictEqual(environment.hashEnvironment, environment.dummyEnvironment);
    });
  });
});
