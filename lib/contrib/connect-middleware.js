"use strict";

var parseUrl       = require('url').parse;
var React          = require('react');
var ReactAsync     = require('react-async');
var merge          = require('react/lib/merge');
var invariant      = require('react/lib/invariant');
var getContentMeta = require('../getContentMeta');


/**
 * A connect middleware for server-side rendering of React Router components.
 * Typically, these are instances of Router, but the only requirements are that
 * the component accepts "path" on "onDispatch" props.
 */
function reactRouter(Router, options) {
  invariant(
    React.isValidClass(Router),
    'Argument must be a React component class but got: %s', Router
  );
  var meta = getContentMeta(options && options.doctype,
                            options && options.contentType);
  var props = options && options.props || {};
  return function(req, res, next) {
    var pathname = parseUrl(req.url).pathname;
    if (pathname == null) {
      next(new Error('Invalid URL: ' + req.url));
      return;
    }

    // This callback is meant to be called multiple times with whatever
    // information is available. It will aggregate the information and send a
    // response or emit an error as soon as is possible.
    var memo = {};
    var callback = function(err, statusCode, markup) {
      if (memo.complete) {
        return; // Don't take action more than once.
      }
      if (err != null) {
        // If we errored, we're done.
        memo.complete = true;
        next(err);
        return;
      }

      // Remember the status code and markup (since we may not get them at the
      // same time).
      if (statusCode != null) {
        memo.statusCode = statusCode;
      }
      if (markup != null) {
        memo.markup = markup;
      }

      // Wait for the render to complete and onDispatch to be invoked.
      if (memo.markup == null || memo.statusCode == null) {
        return;
      }
      memo.complete = true;
      res.statusCode = memo.statusCode;
      res.setHeader('Content-Type', meta.contentType);
      res.end('' + meta.doctype + memo.markup);
    };

    try {
      var app = Router(merge(props, {
        path: pathname,
        onDispatch: function(path, navigation) {
          var statusCode = (navigation && navigation.match &&
                            navigation.match.isNotFound ? 404 : 200);
          callback(null, statusCode);
        }
      }));
      ReactAsync.renderComponentToStringWithAsyncState(
        app,
        function(err, markup) {
          callback(err, null, markup);
        }
      );
    } catch (err) {
      next(err);
    }
  };
}

module.exports = reactRouter;
