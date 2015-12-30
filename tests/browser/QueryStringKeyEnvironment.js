"use strict";

var assert = require('power-assert');
var QuerystringKeyEnvironment = require('../../lib/environment/QuerystringKeyEnvironment');

describe('QuerystringKeyEnvironment', function() {

  var env, origPath;

  beforeEach(function() {
    env = new QuerystringKeyEnvironment('key');
    origPath = window.location.pathname;
  });

  afterEach(function() {
    window.history.pushState({}, '', origPath);
  });

  it('updates the corresponding key in querystring on setPath', function() {
    env.setPath('/x', {});
    assert.equal(window.location.search, '?key=x');
  });

  it('returns a corresponding key from querystring via getPath', function() {
    assert.equal(env.getPath(), '/');
    window.history.pushState({}, '', '/?key=y');
    assert.equal(env.getPath(), '/y');
  });

});
