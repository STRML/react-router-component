# A custom animated Router component with ES6

See also the [docs on a custom Router component](recipes/custom-router).

ES6 classes don't support mixins, but they are needed to define your own custom router.

We can use [react-mixin](https://github.com/brigand/react-mixin) or a higher-order component to fix this.

This example will use react-mixin.

[AnimatedLocations](https://github.com/andreypopp/react-router-page-transition/blob/master/index.js) is a popular
Router override that uses CSS transitions to animated between pages.

To write our own version of this with ES6/ES7, we need a few things:

    import React           from 'react';
    import ReactMixin      from 'react-mixin';
    import { environment, RouteRenderingMixin, RouterMixin, Location, NotFound } from '../../index';
    import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';

We then define the required mixins. Using ES7 decorators, we make it easy:

    let mixin = ReactMixin.decorate;
    @mixin(RouteRenderingMixin)
    @mixin(RouterMixin)
    export default class AnimatedLocations extends React.Component { ...

However, if you don't have access to ES7 decorators, you can still make it work; simply append this *after*
the class:

    ReactMixin.onClass(AnimatedLocations, RouteRenderingMixin);
    ReactMixin.onClass(AnimatedLocations, RouterMixin);

We then define the class itself.

    export default class AnimatedLocations extends React.Component {

      static defaultProps = {
        component: 'div',
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


`<AnimatedLocations>` can then be used in place of the usual `<Locations>` component in a render.

    <AnimatedLocations path={this.props.initialPath} transitionName="fade">
      <Location path="/" handler={Home} />
      <NotFound handler={FourOhFour} />
    </AnimatedLocations>
