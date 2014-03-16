;(function() {

  window.__ReactShim = window.__ReactShim || {};

  window.__ReactShim.invariant = function(check, msg) {
    if (!check) {
      throw new Error(msg);
    }
  }

  var mergeInto = window.__ReactShim.mergeInto = function(dst, src) {
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        dst[k] = src[k];
      }
    }
  }

  window.__ReactShim.merge = function(a, b) {
    var c = {};
    mergeInto(c, a);
    mergeInto(c, b);
    return c;
  }

  window.__ReactShim.emptyFunction = function() {
  }

  window.__ReactShim.ExecutionEnvironment = {
    canUseDOM: true
  };

  window.__ReactShim.ReactUpdates = {
    batchedUpdates: function(cb) { cb(); }
  };

})();
