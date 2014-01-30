BIN = ./node_modules/.bin
REPO = $(shell cat .git/config | grep url | xargs echo | sed -E 's/^url = //g')
REPONAME = $(shell echo $(REPO) | sed -E 's_.+:([a-zA-Z0-9_\-]+)/([a-zA-Z0-9_\-]+)\.git_\1/\2_')

install link:
	@npm $@

lint:
	@$(BIN)/jshint *.js

test:
	@$(BIN)/mocha -b -R spec specs/*.js

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
  	var j = require('./package.json');\
  	j.version = \"$$NEXT_VERSION\";\
  	var s = JSON.stringify(j, null, 2);\
  	require('fs').writeFileSync('./package.json', s);" && \
  git commit -m "release $$NEXT_VERSION" -- package.json && \
  git tag "$$NEXT_VERSION" -m "release $$NEXT_VERSION"
endef
