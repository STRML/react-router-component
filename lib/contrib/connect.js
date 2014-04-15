"use strict";

var URL       = require('url');
var React     = require('react');
var merge     = require('react/lib/merge');
var invariant = require('react/lib/invariant');


function getDoctype(nameOrValue) {
  if (!nameOrValue){
    return '';
  }
  switch (nameOrValue.toString().toLowerCase()) {
  case 'default':
  case '5':
  case 'html':
  case 'html5':
    return '<!DOCTYPE html>';
  case '4':
  case 'html4':
    return '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
  case 'transitional':
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
  case 'strict':
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
  case 'frameset':
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">';
  case '1.1':
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
  case 'basic':
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">';
  case 'mobile':
    return '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">';
  }
  return nameOrValue;
}


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
  var doctype = getDoctype(options && options.doctype);
  var props = options && options.props || {};
  return function(req, res, next) {
    var pathname = URL.parse(req.url).pathname;
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
      res.end('' + doctype + rendered);
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
