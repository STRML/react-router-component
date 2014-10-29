.DELETE_ON_ERROR:

BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

install link:
	@npm $@

lint:
	@./node_modules/.bin/jsxhint index.js `find lib tests \( -iname \*.js -o -iname \*.jsx \)`

test: test-unit test-server
	@echo "The browser test suite should be run before commit. Run 'make test-local' to run it."

test-unit:
	@./node_modules/.bin/mocha -R spec -b tests/matchRoutes.js

test-server:
	@./node_modules/.bin/mocha -R spec -b tests/server.js

test-local:
	@./node_modules/.bin/jsx tests/browser-jsx.jsx > tests/browser-jsx.js
	@./node_modules/.bin/zuul --local 3000  -- tests/browser.js tests/browser-jsx.js

test-cloud:
	@./node_modules/.bin/zuul -- tests/browser.js

release-patch: test lint
	@$(call release,patch)

release-minor: test lint
	@$(call release,minor)

release-major: test lint
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1)
endef
