"use strict";

/* globals describe, it */

var assert          = require('assert');
var matchRoutes     = require('../lib/matchRoutes');

describe('matchRoutes', function() {

  function handler(props) {
    return props;
  }

  var routes = [
    {path: '(/)', handler: handler({name: 'root'})},
    {path: '/cat/:id', handler: handler({name: 'cat'})},
    {path: '/mod/*', handler: handler({name: 'mod'})},
    {path: null, handler: handler({name: 'notfound'})}
  ];

  it('matches ""', function() {
    var match = matchRoutes(routes, '');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'root');
    assert.deepEqual(match.match, {});
    assert.strictEqual(match.path, '');
    assert.strictEqual(match.matchedPath, '');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /', function() {
    var match = matchRoutes(routes, '/');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'root');
    assert.deepEqual(match.match, {});
    assert.strictEqual(match.path, '/');
    assert.strictEqual(match.matchedPath, '/');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /cat/:id', function() {
    var match = matchRoutes(routes, '/cat/hello');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'cat');
    assert.deepEqual(match.match, {id: 'hello'});
    assert.strictEqual(match.path, '/cat/hello');
    assert.strictEqual(match.matchedPath, '/cat/hello');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /mod/wow/here', function() {
    var match = matchRoutes(routes, '/mod/wow/here');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'mod');
    assert.deepEqual(match.match, {_: ['wow/here']});
    assert.strictEqual(match.path, '/mod/wow/here');
    assert.strictEqual(match.matchedPath, '/mod/');
    assert.strictEqual(match.unmatchedPath, 'wow/here');
  });

  it('handles not found', function() {
    var match = matchRoutes(routes, '/hm');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'notfound');
    assert.deepEqual(match.match, null);
    assert.strictEqual(match.path, '/hm');
    assert.strictEqual(match.matchedPath, '/hm');
    assert.strictEqual(match.unmatchedPath, null);
  });
});
