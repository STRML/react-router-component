# Overriding the `url-pattern` compiler

You may have more advanced needs from your url patterns.

The author of `url-pattern`, which does the underlying conversion in RRC from route declaration to RegExp,
[has written documentation on overriding the compiler](https://github.com/snd/url-pattern#modifying-the-compiler).

For example:

    var Router = require('react-router-component');
    var URLPattern = require('url-pattern');

    // Create a compiler that only matches alphabetical characters in urls.
    //
    // This function is passed the props object of the route it is generating a RegExp for.
    // While not recommended, you could use this to generate a different compiler per route.
    Router.createURLPatternCompiler = function(routeProps) {
      var compiler = new URLPattern.Compiler();
      compiler.segmentValueCharset = 'a-zA-Z';
      return compiler;
    }

Overriding the compiler allows you to write very powerful route definitions.

Note that this override is global. At this time, there is no way to define a compiler per Router. If you have
more advanced needs, we recommend using `url-pattern` directly to generate regular expressions to use as route paths,
or using regular expressions directly.

A note on ES6; ES6 modules can't modify `module.exports` directly. Instead, use `setCreateURLPatternCompilerFactory`:

    import * as Router from 'react-router-component';
    import * as URLPattern from 'url-pattern';

    Router.setCreateURLPatternCompilerFactory((routeProps) => {
      var compiler = new URLPattern.Compiler();
      compiler.segmentValueCharset = 'a-zA-Z';
      return compiler;
    })
