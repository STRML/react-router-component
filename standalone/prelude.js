;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else {
    root.ReactRouter = factory(root.React);
  }
})(this, function(React) {

  var Shim = window.__ReactShim = window.__ReactShim || {};

  Shim.React = React;

  Shim.cloneWithProps = React.addons.cloneWithProps;

  Shim.invariant = function(check, msg) {
    if (!check) {
      throw new Error(msg);
    }
  }

  var mergeInto = Shim.mergeInto = function(dst, src) {
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        dst[k] = src[k];
      }
    }
  }

  Shim.merge = function(a, b) {
    var c = {};
    mergeInto(c, a);
    mergeInto(c, b);
    return c;
  }

  Shim.emptyFunction = function() {
  }

  Shim.ExecutionEnvironment = {
    canUseDOM: true
  };

  Shim.ReactUpdates = {
    batchedUpdates: function(cb) { cb(); }
  };

});
