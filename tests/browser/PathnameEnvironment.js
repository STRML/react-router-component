"use strict";

var assert = require('power-assert');
var PathnameEnvironment = require('../../lib/environment/PathnameEnvironment');

describe('PathnameEnvironment', function() {

  var env, origPath;

  beforeEach(function() {
    env = new PathnameEnvironment();
    origPath = window.location.pathname;
  });

  afterEach(function() {
    window.history.pushState({}, '', origPath);
  });

  it('updates the url bar on setPath', function() {
    env.setPath('/foo/bar/baz?key=x', {});
    assert.equal(window.location.pathname, '/foo/bar/baz');
    assert.equal(window.location.search, '?key=x');
  });

  it('returns the full url via getPath', function() {
    assert.equal(env.getPath(), origPath);
    window.history.pushState({}, '', '/foo/bar/biff?key=y');
    assert.equal(env.getPath(), '/foo/bar/biff?key=y');
  });

});
