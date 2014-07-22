"use strict";

/* globals describe, it, beforeEach, afterEach */

var assert                    = require('assert');
var QuerystringKeyEnvironment = require('../lib/environment/QuerystringKeyEnvironment');

describe('QuerystringKeyEnvironment', function() {

  var env;

  beforeEach(function() {
    env = new QuerystringKeyEnvironment('key');
  });

  afterEach(function() {
    window.history.pushState({}, '', '/');
  });

  it('updates the corresponding key in querystring on setPath', function() {
    env.setPath('/x', {});
    assert.equal(location.search, '?key=x');
  });

  it('returns a corresponding key from querystring via getPath', function() {
    assert.equal(env.getPath(), '/');
    window.history.pushState({}, '', '/?key=y');
    assert.equal(env.getPath(), '/y');
  });

});
