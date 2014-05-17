.DELETE_ON_ERROR:

bundle.js: index.js
	browserify -t [ reactify --es6 ] $< > $@
