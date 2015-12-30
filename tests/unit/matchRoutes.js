'use strict';
import assert      from 'power-assert';
import matchRoutes from '../../lib/matchRoutes';
import React       from 'react';
import {Location, NotFound} from '../../';

describe('matchRoutes', function() {

  var routes = [
    <Location path='(/)' handler={<div name="root" />} />,
    <Location path='/cat/:id' handler={<div name="cat" />} />,
    <Location path='/mod/*' handler={<div name="mod" />} />,
    <Location path={/\/regex\/([a-zA-Z]*)$/} handler={<div name="regex" />} />,
    <Location path={/\/(.*?)\/(\d)\/([a-zA-Z]*)$/} handler={<div name="regexMatch" />}
              urlPatternOptions={['name', 'num', 'text']} />,
    <NotFound handler={<div name="notfound" />} />
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

  it('fails to match /cat/:id with periods in param', function() {
    var match = matchRoutes(routes, '/cat/hello.with.periods');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'notfound');
    assert.deepEqual(match.match, null);
    assert.strictEqual(match.path, '/cat/hello.with.periods');
    assert.strictEqual(match.matchedPath, '/cat/hello.with.periods');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches /cat/:id with a custom url-pattern options and periods in param', function() {
    var match = matchRoutes(routes, '/cat/hello.with.periods', {
      segmentValueCharset: 'a-zA-Z0-9_\\- %\\.'
    });
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'cat');
    assert.deepEqual(match.match, {id: 'hello.with.periods'});
    assert.strictEqual(match.path, '/cat/hello.with.periods');
    assert.strictEqual(match.matchedPath, '/cat/hello.with.periods');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches a very custom url-pattern compiler config', function() {
    var route = <Location path="[http[s]!://][$sub_domain.]$domain.$toplevel-domain[/?]"
                          handler={<div name="parseDomain" />} />;

    // Lifted from url-pattern docs
    var urlPatternOptions = {
      escapeChar: '!',
      segmentNameStartChar: '$',
      segmentNameCharset: 'a-zA-Z0-9_-',
      segmentValueCharset: 'a-zA-Z0-9',
      optionalSegmentStartChar: '[',
      optionalSegmentEndChar: ']',
      wildcardChar: '?'
    };

    var match = matchRoutes([route], 'https://www.github.com/strml/react-router-component', urlPatternOptions);
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'parseDomain');
    assert.deepEqual(match.match, {sub_domain: 'www', domain: 'github', 'toplevel-domain': 'com',
                                   _: ['strml/react-router-component']});
    assert.strictEqual(match.path, 'https://www.github.com/strml/react-router-component');
    assert.strictEqual(match.matchedPath, 'https://www.github.com/');
    assert.strictEqual(match.unmatchedPath, 'strml/react-router-component');
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

  it('matches /regexMatch/2/foobar', function() {
    var match = matchRoutes(routes, '/regexMatch/2/foobar');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'regexMatch');
    assert.deepEqual(match.match, {name: 'regexMatch', num: '2', text: 'foobar'});
    assert.strictEqual(match.path, '/regexMatch/2/foobar');
    assert.strictEqual(match.matchedPath, '/regexMatch/2/foobar');
    assert.strictEqual(match.unmatchedPath, null);
  });

  it('matches query strings', function() {
    var match = matchRoutes(routes, '/cat/hello?foo=bar&baz=biff');
    assert(match.route);
    assert.strictEqual(match.route.props.handler.props.name, 'cat');
    assert.deepEqual(match.match, {id: 'hello'});
    assert.strictEqual(match.path, '/cat/hello');
    assert.strictEqual(match.matchedPath, '/cat/hello');
    assert.strictEqual(match.unmatchedPath, null);
    assert.deepEqual(match.query, {foo : 'bar', baz: 'biff'});
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
