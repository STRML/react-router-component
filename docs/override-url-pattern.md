# Overriding the `url-pattern` compiler

You may have more advanced needs from your url patterns.

The author of `url-pattern`, which does the underlying conversion in RRC from route declaration to RegExp,
[has written documentation on overriding the compiler](https://github.com/snd/url-pattern#customize-the-pattern-syntax).

Compile an object matching these fields and pass it on your `<Location>` or `<Locations>` to override `url-pattern`
defaults.

It's possible to set more specific rules on individual `<Location>` components. These rules will be merged
with parent rules. Rules are even merged from parent contextual routers!

For example:

    ...
    <Locations urlPatternOptions={{escapeChar: '|'}}>
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} urlPatternOptions={{segmentValueCharset: 'a-zA-Z0-9'}} />
      <Location path="/search/*" handler={SearchPage} />
      <Location path={/\/product\/([0-9]*)/} handler={ProductPage} />
    </Locations>
    ```

Overriding the compiler allows you to write very powerful route definitions.
