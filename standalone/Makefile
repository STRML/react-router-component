.DELETE_ON_ERROR:

BIN = ../node_modules/.bin
PATH := $(BIN):$(PATH)
NAME = ReactRouter

build: \
	react-router-component.js \
	react-router-component.min.js

react-router-component.prod.js: prelude.js index.js lib/*.js
	@mkdir -p $(@D)
	@cat ./prelude.js > $@
	@NODE_ENV=production browserify \
		--transform browserify-shim \
		--standalone $(NAME) \
		./ >> $@

react-router-component.min.js: react-router-component.prod.js
	@cat $< | uglifyjs -cm > $@

react-router-component.js: prelude.js index.js lib/*.js
	@mkdir -p $(@D)
	@cat ./prelude.js > $@
	@NODE_ENV=development browserify \
		--transform browserify-shim \
		--standalone $(NAME) \
		./ >> $@

clean:
	@rm -f \
		react-router-component.js \
		react-router-component.prod.js \
		react-router-component.min.js
