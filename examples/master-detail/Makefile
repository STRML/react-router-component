NPM_BIN=$(shell npm bin)
export PATH := $(NPM_BIN):$(PATH)
.DELETE_ON_ERROR:

bundle.js: index.js
	browserify -t [ babelify ] $< > $@
