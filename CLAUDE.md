# React Router Component

Declarative router component for React. Allows routes to be defined directly as part of the component hierarchy.

## Commands

```bash
# Install dependencies (uses npm)
npm install

# Run all tests (unit + server)
make test

# Run unit tests only
make test-unit

# Run server tests only
make test-server

# Run browser/E2E tests with Playwright
make test-e2e

# Lint the codebase
make lint

# Using npm scripts
npm test        # Runs make test
npm run test:e2e # Runs make test-e2e
npm run lint    # Runs make lint
```

## Architecture

### Key Files

- `index.js` - Main entry point, exports all public components and mixins
- `lib/Router.js` - Core Router component (Locations, Pages)
- `lib/Route.js` - Route component (Location, Page, NotFound)
- `lib/Link.js` - Link component for navigation
- `lib/RouterMixin.js` - Mixin providing core routing logic
- `lib/RouteRenderingMixin.js` - Mixin for rendering matched routes
- `lib/NavigatableMixin.js` - Mixin for programmatic navigation
- `lib/CaptureClicks.js` - Component to capture anchor clicks for routing
- `lib/matchRoutes.js` - Route matching logic

### Environments

Located in `lib/environment/`:
- `Environment.js` - Base environment class
- `PathnameEnvironment.js` - Uses `location.pathname` (History API)
- `HashEnvironment.js` - Uses `location.hash` (fallback for older browsers)
- `QuerystringKeyEnvironment.js` - Uses querystring parameter
- `LocalStorageKeyEnvironment.js` - Uses localStorage
- `DummyEnvironment.js` - For server-side rendering

### Tests

- `tests/unit/` - Unit tests (Mocha with Babel, Node.js assert)
  - `matchRoutes.js` - Route matching tests
  - `RouterMixin.js` - Router mixin tests
  - `Route.js` - Location/NotFound component tests
  - `Link.js` - Link component tests
  - `environment.js` - Environment module tests
- `tests/server/` - Server-side rendering tests
- `tests/e2e/` - End-to-end browser tests (Playwright)
  - `routing.spec.js` - Comprehensive routing tests
  - `test-app.jsx` - Test React application
  - `server.js` - Test server for E2E tests

## Conventions

- Uses CommonJS modules (require/module.exports)
- Uses `create-react-class` for component definitions
- Uses mixins for shared functionality
- Supports React 15 and 16

## Pre-commit Hooks

The project runs lint and test before each commit via `pre-commit` package.
