# CHANGELOG

## 0.20.1

  - Fixed `reactify` devdep in examples.
  - Fixed crash on null/undefined inside `<Locations>`. You may now use
    ternary expressions to remove a `<Location>` based on a condition.

## 0.20.0

  - Updated to React 0.11.
  - Fixed intra-page hash routing (scrolling to anchors).

## 0.19.0

  - Updated `url-pattern`, supports optional patterns.

## 0.18.4

  - IE8 compat fixes

## 0.18.3

  - Made `getParentRouter()` method optional when implementing new routers.

## 0.18.2

  - update react-async dep

## 0.18.1

  - fix IE9 not to use pathnameEnvironment by default (pushState is absent
    there).

## 0.18.0

  - **breaking change** Router now only prefetches async state (via react-async)
    if and only if current handler's type is different from next handler's type.

    This now matches the behaviour of getInitialState which is only called once
    for each component instance.

    If you have your async state dependent on props, you need to initiate async
    state update in `componentWillReceiveProps(nextProps)` by using values from
    `nextProps`.

## 0.17.0

  - Add `<CaptureClicks>` component to capture clicks on `<a>`-elements and turn
    them into in-app navigation actions. Thanks to Matthew Dapena-Tretter
    (@matthewwithanm on GitHub).

## 0.16.0

  - RouterMixin now delegates state update to setRoutingState method if it's
    available.

  - AsyncRouteRenderingMixin now provides implementation of setRoutingState
    store pendingState update in router's state.

  - AsyncRouteRenderingMixin now provides hasPendingUpdate() which returns t
    if router has active pendingState. This fixes #23.

  - Handler component is now instantiated during state update.

## 0.15.3

  - RouterMixin doesn't specify onNavigation/onBeforeNavigation in
    getDefaultProps and thus allows to specify them in user code (#22).

## 0.15.2

  - Fix bug with require('./environment') using an invalid case.

## 0.15.1

  - Bump react-async to 0.8.0.

  - Fixes to environments, now they properly unsubscribe event listeners.

## 0.15.0

  - Update react dep to 0.10.0. Fix few warnings in test suite.

## 0.14.0

  - Expose environment and environment implementations.

## 0.13.0

  - Contextual routers are only can be in context of other routers if they share
    the same environment.

  - If contextual routers isn't given an environment (via `hash` or
    `environment` prop) then it is default to an environment from parent's
    router if any.

## 0.12.1

  - Do not set `key` prop on handler, this fixes a bug when the same handler
    component will make DOM to be resetted with innerHTML which is neither nice
    nor performant. Also that didn't work with async components.

## 0.12.0

  - `Link.props.onClick` now can prevent navigation by calling
    `event.preventDefault()`. Thanks to Matthew Dapena-Tretter
    (@matthewwithanm on GitHub).

## 0.11.0

  - Add onNavigation and onBeforeNavigation callbacks. Thanks to Dave Mac
    (@DveMac in GitHub).

## 0.10.2

  - Use envify transform for browserify

## 0.10.1

  - Fix bug with router unregistration.

## 0.10.0

  - Handle Router.navigate(path, {replace: true) and `<Link replace />` by
    replacing the current history record instead creating a new one.

## 0.9.2

  - Fix recalculating router's state on new props

## 0.9.1

  - Fix hash router to normalize path correctly ('' coerces to '/')

## 0.9.0

  - Custom routers can now have access to per-navigation params via
    `this.state.navigation`. For example navigation occurred as a result of
    popstate/hashchange event no has `this.state.navigate.isPopState` set to
    `true`.

## 0.8.0

  - `globalHash` property for `Link` to force it to navigate using
    `hashEnvironment`

## 0.7.0

  - Router component now waits for async components (via react-async) before
    updating itself

  - remove Hash namespace, use `hash` prop instead:

    <Locations hash>...</Locations>

  - RouterMixin now doesn't access this.props.children directly but instead gets
    routes via getRoutes() method

  - rework NavigatableMixin: add getPath(), navigate(path, cb), makeHref(path)
    methods, remove getRouter() method

  - add AsyncRouteRenderingMixin

  - add RouteRenderingMixin

  - Link components now generate valid href when instantiated inside contextual
    routers

  - Link components now accept `global` prop to create a link which is forced to
    operate outside of a local router's context

## 0.6.0

  - factor out RouterMixin for reusability
  - expose environment

## 0.5.1

  - fixes for server side rendering

  - browser test suite refactored to use ReactTestUtils

## 0.5.0

  - Location now passes all props to its handler (except "path" and "handler"
    which are reserved for Location)

## 0.4.0

  - Link component can now communicate with the router (of the default
    environment) outside of router context

## 0.3.2

  - do not pollute history with duplicate entries (breaks forward button
    behaviour)

## 0.3.1

  - fix server side usage

## 0.3.0

  - update react version to 0.9.0

  - environments are now aggregated (reduced number of event listeners)

  - support for hash routers

  - support for contextual routers

  - Link component for navigation

## 0.2.1

  - support for routers with just a single location

## 0.2.0

  - allow passing handlers via "handler" prop

## 0.1.1

  - fix bug with router re-rendering

## 0.1.0

  - initial release
