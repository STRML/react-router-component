// Compiled with Babel, don't run directly, run via index.js
if (!require.extensions['.es6']) {
  throw new Error("This example must be started via the index.js hook, which installs the Babel loader for ES6.");
}

import React           from 'react';
import ReactMixin      from 'react-mixin';
import { environment, RouteRenderingMixin, RouterMixin, Location, NotFound } from '../../index';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';

// If you're okay with ES7 in your app, do this:
let mixin = ReactMixin.decorate;
@mixin(RouteRenderingMixin)
@mixin(RouterMixin)
export default class AnimatedLocations extends React.Component {

  static defaultProps = {
    component: 'div',
    transitionName: 'fade'
  }

  getRoutes(props) {
    return props.children;
  }

  render() {
    // A key MUST be set in order for transitionGroup to work.
    var handler = this.renderRouteHandler({key: this.state.match.path});
    // TransitionGroup takes in a `component` property, and so does AnimatedLocations, so we pass through
    return <TransitionGroup {...this.props}>{handler}</TransitionGroup>;
  }

}

// If you're not using ES7, do this instead.
// ReactMixin.onClass(AnimatedLocations, RouteRenderingMixin);
// ReactMixin.onClass(AnimatedLocations, RouterMixin);

//
// Basic components
//

class Home extends React.Component {
  render() {
    return <div>Home</div>;
  }
}

class FourOhFour extends React.Component {
  render() {
    return <b>Not Found!</b>;
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="body">
        <h3>ES6 Example</h3>
        <AnimatedLocations path={this.props.initialPath}>
          <Location path="/" handler={Home} />
          <NotFound handler={FourOhFour} />
        </AnimatedLocations>
      </div>
    );
  }
}

console.log("Rendering Home:");
console.log(React.renderToString(<App initialPath="/" />));
console.log("Rendering 404:");
console.log(React.renderToString(<App initialPath="/blargwaffles" />));
