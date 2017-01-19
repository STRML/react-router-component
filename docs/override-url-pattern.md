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
    ...

Overriding the compiler allows you to write very powerful route definitions.

## Centralized named segment value decoding:

Additionally, you may want to decode a value from a named segment such that your handlers see the decoded value.

for example, lets say you have email address usernames. (eg: foo@bar.com) Your routes would be like `/users/foo%40bar.com` and without this config, your handler would get a prop of `username="foo%40bar.com"`. 

In this example, the decoder would ensure that UserPage gets `username="foo@bar.com"` and ***not*** `username="foo%40bar.com"`

```
const decoders = {
    //for every named segment, there can be a decode function...
    username: (value) => decodeURIComponent(value)
}

function View (props) {
  return (
    <Locations 
      urlPatternOptions={{
        namedSegmentValueDecoders: decoders, //pass the decoders-map
        segmentValueCharset: 'a-zA-Z0-9-+_.%' //allow email-like values
      }}
    >
      <Location path="/" handler={MainPage} />
      <Location path="/users/:username" handler={UserPage} />
    </Locations>
  );
}
```

