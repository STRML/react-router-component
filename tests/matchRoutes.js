'use strict';
var assert      = require('assert');
var matchRoutes = require('../lib/matchRoutes');
var React       = require('react');
var Router      = require('../');
var Location       = React.createFactory(Router.Location);
var NotFound    = React.createFactory(Router.NotFound);

describe('matchRoutes', function() {

  function handler(props) {
    return React.DOM.div(props);
  }
  var routes = [
    Location({path: '(/)', handler: handler({name: 'root'})}),
    Location({path: '/cat/:id', handler: handler({name: 'cat'})}),
    Location({path: '/mod/*', handler: handler({name: 'mod'})}),
    Location({path: /\/regex\/([a-zA-Z]*)$/, handler: handler({name: 'regex'})}),
    NotFound({handler: handler({name: 'notfound'})})
  ];

  it('matches ""', function() {
    var match = matchRoutes(routes, '');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'root');
    assert.deepEqual(match.match, {});
    assert.strictEqual(match.path, '');
    assert.strictEqual(match.matchedPath, '');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /', function() {
    var match = matchRoutes(routes, '/');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'root');
    assert.deepEqual(match.match, {});
    assert.strictEqual(match.path, '/');
    assert.strictEqual(match.matchedPath, '/');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /cat/:id', function() {
    var match = matchRoutes(routes, '/cat/hello');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'cat');
    assert.deepEqual(match.match, {id: 'hello'});
    assert.strictEqual(match.path, '/cat/hello');
    assert.strictEqual(match.matchedPath, '/cat/hello');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /mod/wow/here', function() {
    var match = matchRoutes(routes, '/mod/wow/here');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'mod');
    assert.deepEqual(match.match, {_: ['wow/here']});
    assert.strictEqual(match.path, '/mod/wow/here');
    assert.strictEqual(match.matchedPath, '/mod/');
    assert.strictEqual(match.unmatchedPath, 'wow/here');
  });

  it('matches /regex/text', function() {
    var match = matchRoutes(routes, '/regex/text');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'regex');
    assert.deepEqual(match.match, {_: ['text']});
    assert.strictEqual(match.path, '/regex/text');
    assert.strictEqual(match.matchedPath, '/regex/');
    assert.strictEqual(match.unmatchedPath, 'text');
  });

  it('does not match /regex/1text', function() {
    var match = matchRoutes(routes, '/regex/1text');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'notfound');
    assert.deepEqual(match.match, null);
    assert.strictEqual(match.path, '/regex/1text');
    assert.strictEqual(match.matchedPath, '/regex/1text');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('handles not found', function() {
    var match = matchRoutes(routes, '/hm');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'notfound');
    assert.deepEqual(match.match, null);
    assert.strictEqual(match.path, '/hm');
    assert.strictEqual(match.matchedPath, '/hm');
    assert.strictEqual(match.unmatchedPath, null);
  });
});
