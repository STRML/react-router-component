"use strict";

var parseUrl       = require('url').parse;
var React          = require('react');
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

    var statusCode;
    var rendered;

    var callback = function() {
      // Wait for the render to complete and onDispatch to be invoked.
      if (rendered == null || statusCode == null) {
        return;
      }
      res.statusCode = statusCode;
      res.setHeader('Content-Type', meta.contentType);
      res.end('' + meta.doctype + rendered);
    };

    try {
      var app = Router(merge(props, {
        path: pathname,
        onDispatch: function(path, navigation) {
          statusCode = (navigation && navigation.match &&
                        navigation.match.isNotFound ? 404 : 200);
          callback();
        }
      }));
      rendered = React.renderComponentToString(app);
      callback();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  reactRouter: reactRouter
};
