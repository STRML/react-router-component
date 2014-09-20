var assert          = require('assert');
var matchRoutes     = require('../lib/matchRoutes');

describe('matchRoutes', function() {

  function handler(props) {
    return props;
  }

  var routes = [
    {path: '/', handler: handler({name: 'root'})},
    {path: '/cat/:id', handler: handler({name: 'cat'})},
    {path: '/mod/*', handler: handler({name: 'mod'})},
    {path: '/dog/*/pups', keys: [{name: 'lineage'}], handler: handler({name: 'dog'})},
    {pattern: /^\/catalogue\/([0-9]+)\/([0-9]+)$/, keys: [{name: 'category'}, {name: 'product'}], handler: handler({name: 'catalogue'})},
    {path: null, handler: handler({name: 'notfound'})}
  ];

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
    assert.strictEqual(match.path, '/mod/wow/here');
    assert.strictEqual(match.matchedPath, '/mod/');
    assert.strictEqual(match.unmatchedPath, 'wow/here');
  });

  it('matches /dog/first/second/pups', function() {
    var match = matchRoutes(routes, '/dog/first/second/pups');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'dog');
    assert.deepEqual(match.match, {lineage: 'first/second'});
    assert.strictEqual(match.path, '/dog/first/second/pups');
    assert.strictEqual(match.matchedPath, '/dog/first/second/pups');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /catalogue/42/1337', function() {
    var match = matchRoutes(routes, '/catalogue/42/1337');
    assert(match.route);
    assert.strictEqual(match.route.handler.name, 'catalogue');
    assert.deepEqual(match.match, {category: 42, product: 1337});
    assert.strictEqual(match.path, '/catalogue/42/1337');
    assert.strictEqual(match.matchedPath, '/catalogue/42/1337');
    assert.strictEqual(match.unmatchedPath, null);
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
