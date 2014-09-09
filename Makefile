.DELETE_ON_ERROR:

BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

install link:
	@npm $@

lint:
	@jshint index.js `find lib tests -name '*.js'`

test: test-unit test-server

test-unit:
	@mocha -R spec -b tests/matchRoutes.js

test-server:
	@mocha -R spec -b tests/server.js

test-local:
	@zuul --local 3000  -- tests/browser.js

test-cloud:
	@zuul -- tests/browser.js

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
