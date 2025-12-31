.DELETE_ON_ERROR:

BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

install link:
	@npm $@

lint:
	@./node_modules/.bin/eslint index.js `find lib tests \( -iname \*.js -o -iname \*.jsx \) -not -path 'tests/e2e/bundle.js'`

test: test-unit test-server
	@echo "Run 'make test-e2e' to run browser tests with Playwright."

test-unit:
	@env NODE_ENV=test node --no-experimental-detect-module ./node_modules/.bin/mocha -R spec --require @babel/register -b tests/unit/*.js

test-server:
	@env NODE_ENV=test node --no-experimental-detect-module ./node_modules/.bin/mocha -R spec --require @babel/register -b tests/server/*.js

test-e2e: build-e2e
	@./node_modules/.bin/playwright test

build-e2e:
	@./node_modules/.bin/esbuild tests/e2e/test-app.jsx --bundle --outfile=tests/e2e/bundle.js --define:process.env.NODE_ENV=\"test\"

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
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
	node -e "\
		['./package.json'].forEach(function(fileName) {\
			var j = require(fileName);\
			j.version = \"$$NEXT_VERSION\";\
			var s = JSON.stringify(j, null, 2);\
			require('fs').writeFileSync(fileName, s);\
		});" && \
	git add package.json CHANGELOG.md && \
	git commit -m "release v$$NEXT_VERSION" && \
	git tag "v$$NEXT_VERSION" -m "release v$$NEXT_VERSION"
endef
