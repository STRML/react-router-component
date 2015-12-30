.DELETE_ON_ERROR:

BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

install link:
	@npm $@

lint:
	@./node_modules/.bin/eslint index.js `find lib tests \( -iname \*.js -o -iname \*.jsx \)`

test: test-unit test-server
	@echo "The browser test suite should be run before commit. Run 'make test-local' to run it."

test-unit:
	@env NODE_ENV=test ./node_modules/.bin/mocha -R spec --compilers js:babel/register -b tests/unit/*.js

test-server:
	@env NODE_ENV=test ./node_modules/.bin/mocha -R spec --compilers js:babel/register -b tests/server/*.js

test-local:
	@env NODE_ENV=test ./node_modules/.bin/babel tests/browser/browser-jsx.jsx > tests/browser/browser-jsx.js
	@env NODE_ENV=test ./node_modules/.bin/zuul --local 3000  -- tests/browser/*.js

test-cloud:
	@env NODE_ENV=test ./node_modules/.bin/zuul -- tests/browser/*.js

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
