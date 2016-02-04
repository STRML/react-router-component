import assert from 'power-assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Link, Location, Locations, Pages, NotFound } from '../../index';

describe('react-router-component (on server)', function() {

  describe('basic rendering', function() {
    class rendersSlug extends React.Component {
      render() {
        return <div>
                 {this.props.slug}
               </div>;
      }
    }
    class rendersFirstMatch extends React.Component {
      render() {
        return <div>
                 {this.props._[0]}
               </div>;
      }
    }
    class rendersMatches extends React.Component {
      render() {
        return <div>
                 {this.props.match1 + this.props.match2}
               </div>;
      }
    }
    class App extends React.Component {
      render() {
        return <Locations className="App" path={this.props.path}>
                 <Location path="/" handler={<div>mainpage</div>} />
                 <Location path="/x/:slug" handler={rendersSlug} />
                 <Location path={/\/y(.*)/} handler={rendersFirstMatch} />
                 <Location path={/\/z\/(.*)\/(.*)/}
                   urlPatternOptions={['match1', 'match2']}
                   handler={rendersMatches} />
                 <NotFound handler={<div>not_found</div>} />
               </Locations>;
      }
    }

    it('renders to /', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/mainpage/));
    });

    it('renders to /:slug', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/x/hello" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/hello/));
    });

    it('renders with regex', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/y/ohhai" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/ohhai/));
    });

    it('renders with regex and urlPatternOptions(matchKeys)', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/z/one/two" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/onetwo/));
    });

    it('renders to empty on notfound', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/notfound" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/not_found/));
    });
  });

  describe('pages router', function() {
    class App extends React.Component {
      render() {
        return <Pages className="App" path={this.props.path}>
                 <Location path="/" handler={<div>mainpage</div>} />
               </Pages>;
      }
    }

    it('renders to <body>', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/" />);
      assert.equal(markup, '<body class="App"><div>mainpage</div></body>');
    });
  });

  describe('Custom Component', function() {
    class AppSection extends React.Component {
      render() {
        return <Locations className="App" path={this.props.path} component="section">
                 <Location path="/" handler={<div>mainpage</div>} />
               </Locations>;
      }
    }

    class AppNoWrapper extends React.Component {
      render() {
        return <Locations className="App" path={this.props.path} component={null}>
                 <Location path="/" handler={<div>mainpage</div>} />
               </Locations>;
      }
    }

    it('renders to <section>', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<AppSection path="/" />);
      assert.equal(markup, '<section class="App"><div>mainpage</div></section>');
    });

    it('removes wrapper with falsy value', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<AppNoWrapper path="/" />);
      assert.equal(markup, '<div>mainpage</div>');
    });
  });

  describe('contextual router', function() {
    class rendersSubSlug extends React.Component {
      render() {
        return <Link href={'/sup-' + this.props.subslug} />;
      }
    }
    class ContextualRouter extends React.Component {
      render() {
        return <Locations className="X" contextual={true}>
                 <Location path="/hello" handler={<Link href="/hi" />} />
                 <Location path="/hello2" handler={<Link href="/hi" global={true} />} />
                 <Location path="/hello3/*" handler={<Locations className="Y" contextual={true}>
                                                       <Location path="/:subslug" handler={rendersSubSlug} />
                                                     </Locations>} />
               </Locations>;
      }
    }

    class App extends React.Component {
      render() {
        return <Locations className="App" path={this.props.path}>
                 <Location path="/x/:slug/*" handler={ContextualRouter} />
               </Locations>;
      }
    }

    it('renders Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/x/nice/hello" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/x\/nice\/hi"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/x/nice/hello2" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/href="\/hi"/));
    });

    it('renders Link component with href scoped to its nested context prefix', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/x/nice/hello3/welcome" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="X"/));
      assert(markup.match(/class="Y"/));
      assert(markup.match(/href="\/x\/nice\/hello3\/sup-welcome"/));
    });
  });

  describe('nested contextual routers', function() {
    class RendersLinkSlug extends React.Component {
      render() {
        return <Link global={true} href="/hi" data-slug={this.props.slug} />;
      }
    }
    class Level2 extends React.Component {
      render() {
        var thisSlug = this.props.slug;
        return <Locations className="L2" contextual={true}>
                 <Location path="/" handler={<Link href="/hello" data-slug={thisSlug} />} />
                 <Location path="/:slug" handler={RendersLinkSlug} />
               </Locations>;
      }
    }

    class Level1 extends React.Component {
      render() {
        var thisSlug = this.props.slug;
        return <Locations className="L1" contextual={true}>
                 <Location path="/" handler={<Link href="/l2" data-slug={thisSlug} />} />
                 <Location path="/:slug(/*)" handler={Level2} />
               </Locations>;
      }
    }

    class App extends React.Component {
      render() {
        return <Locations className="App" path={this.props.path}>
                 <Location path="/l1/:slug(/*)" handler={Level1} />
               </Locations>;
      }
    }

    it('renders Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/l1/nice" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders Link component with href scoped to its prefix - trailing slash', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/l1/nice/" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/href="\/l1\/nice\/l2"/));
      assert(markup.match(/data-slug="nice"/));
    });

    it('renders nested Link component with href scoped to its prefix', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/l1/nice/l2" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L1"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/l1\/nice\/l2\/hello"/));
      assert(markup.match(/data-slug="l2"/));
    });

    it('renders global Link component with correct href (not scoped to a router)', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/l1/nice/l2/foo" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/class="L2"/));
      assert(markup.match(/href="\/hi"/));
      assert(markup.match(/data-slug="foo"/));
    });
  });

  describe('context passing', function() {
    class Inner extends React.Component {
      render() {
        assert(this.context.flux && this.context.flux.key);
        return <div>
                 {this.context.flux.key}
               </div>;
      }
    }

    Inner.contextTypes = {
      flux: React.PropTypes.object
    };

    Inner.displayName = 'Inner';

    class App extends React.Component {
      getChildContext() {
        return {
          flux: {
            key: 'flux_value'
          }
        };
      }

      getRoutes() {
        return [
          <Location path="/" handler={Inner} />,
          <Location path="/blargh" handler={<div>wrong way</div>} />,
          <NotFound handler={<div>not found</div>} />
        ];
      }

      render() {
        var routes = this.getRoutes();

        return <div className="App">
                 <div>
                   <Locations path={this.props.path} children={routes} />
                 </div>
               </div>;
      }
    }

    App.childContextTypes = {
      flux: React.PropTypes.object
    };

    it('renders to / with context intact', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/" />);
      assert(markup.match(/class="App"/));
      assert(markup.match(/flux_value/));
    });
  });

  describe('urlPatternOptions hierarchy', function() {
    class Inner extends React.Component {
      render() {
        return <div>
                 {this.props.foo + '|' + this.props.bar + this.props._}
               </div>;
      }
    }

    Inner.displayName = 'Inner';

    class App extends React.Component {
      getRoutes() {
        return [
          <Location path="/1/$foo/$bar" handler={Inner} />,
          <Location path="/2/$foo/$bar"
            handler={Inner}
            urlPatternOptions={{segmentValueCharset: 'A-Z'}} />,
          <Location path="/3/!foo/!bar"
            handler={Inner}
            urlPatternOptions={{segmentNameStartChar: '!'}} />,
          <Location path="/4/[foo]?"
            handler={Inner}
            urlPatternOptions={{optionalSegmentStartChar: '[',  optionalSegmentEndChar: ']'}} />,
          <NotFound handler={<div>not found</div>} />
        ];
      }

      render() {
        return <div className="App">
                 <Locations path={this.props.path} urlPatternOptions={{wildcardChar: '?'}}>
                   <Location path="/start?" handler={<div>
                                                       <Locations contextual={true}
                                                         children={this.getRoutes()}
                                                         urlPatternOptions={{segmentNameStartChar: '$'}} />
                                                     </div>} />
                   <NotFound handler={<div>not found</div>} />
                 </Locations>
               </div>;
      }
    }

    it('passes urlPatternOptions from parent <Locations>', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/start/1/biff/baz" />);
      assert(markup.match(/biff\|baz/));
    });

    it('merges urlPatternOptions from parent <Locations> and a <Location>', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/start/2/BIFF/BA" />);
      assert(markup.match(/BIFF\|BA/));
      markup = ReactDOMServer.renderToStaticMarkup(<App path="/start/2/biff/ba" />);
      assert(markup.match(/not found/));
    });

    it('gives urlPatternOptions on route precedence over router', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/start/3/biff/boff" />);
      assert(markup.match(/biff\|boff/));
    });

    it('inherits from parent contextual router', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/start/4/foobar" />);
      assert(markup.match(/undefined\|undefinedbar/));
    });
  });

  describe('props on router (childProps)', function() {
    class App extends React.Component {
      render() {
        return (
          <Locations className="X" childProps={{className: "A", 'data-from-first': 'A'}} path={this.props.path}>
            <Location path="/" handler={<div>mainpage</div>} />
            <Location path="/hasclassname" handler={<div className="ownClassname" />} />
            <Location path="/nested/*" handler={
              <Locations className="Y" data-own-prop={true} contextual={true} childProps={{className: "B", 'data-from-second': 'B'}}>
                <Location path="/foo" handler={<div>foo</div>} />
                {/* Rabbit hole it */}
                <Location path="/nestedAgain/*" handler={
                  <Locations className="Z" data-own-prop={true} contextual={true} childProps={{className: "C", 'data-from-third': 'C'}}>
                    <Location path="/bar" handler={<div>bar</div>} />
                  </Locations>}
                />
              </Locations>} />
          </Locations>
        );
      }
    }

    it('passes className', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/" />);
      assert(markup.match(/<div class="A" [^>]*>mainpage/));
    });

    it('does not override child classname', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/hasclassname" />);
      assert(markup.match(/<div class="ownClassname"/));
    });

    it('passes childProps to contextual children, but inner childProps have priority', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/nested/foo" />);
      assert.equal(markup, '<div class="X"><div class="Y" data-own-prop="true" data-from-first="A">' +
        '<div class="B" data-from-first="A" data-from-second="B">foo</div></div></div>');
    });

    it('keeps going and going', function() {
      var markup = ReactDOMServer.renderToStaticMarkup(<App path="/nested/nestedAgain/bar" />);
      assert.equal(markup, '<div class="X"><div class="Y" data-own-prop="true" data-from-first="A">' +
        '<div class="Z" data-own-prop="true" data-from-first="A" data-from-second="B">' +
        '<div class="C" data-from-first="A" data-from-second="B" data-from-third="C">bar' +
        '</div></div></div></div>');
    });
  });

});
