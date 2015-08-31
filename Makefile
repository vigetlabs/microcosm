SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
DIST  := dist
JS    := $(shell find src -name '*.js*' ! -path '*/__tests__/*') $(shell find addons -name '*.js*' ! -path '*/__tests__/*')

.PHONY: clean test test-watch release example website
.FORCE: javascript-min

build: package.json README.md LICENSE.md docs javascript javascript-min
	@make audit

$(DIST):
	@mkdir -p $(DIST)

%.md: $(DIST)
	cp $@ $^

package.json: $(DIST)
	@node -p 'p=require("./package");p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $(DIST)/package.json

docs: $(DIST)
	cp -r $@ $^

javascript: $(DIST)
	@babel -d $^ $(JS)

javascript-min: javascript
	@NODE_ENV=production \
	webpack -p dist/src/Microcosm.js $(DIST)/microcosm.build.js \
	--devtool sourcemap --output-library-target commonjs2 \
	--optimize-minimize --optimize-occurence-order --optimize-dedupe

release: clean build
	npm publish $(DIST)

prerelease: clean build
	npm publish $(DIST) --tag beta

example:
	@webpack-dev-server \
	--config examples/webpack.config.js \
	--content-base examples \
	--publicPath assets \
	--historyApiFallback true

site:
	make -C site

clean:
	@rm -rf $(DIST)

audit:
	@echo "Compressed Size:"
	@cat $(DIST)/microcosm.build.js | wc -c
	@echo "Gzipped Size:"
	@gzip -c $(DIST)/microcosm.build.js | wc -c

test:
	NODE_ENV=test karma start --single-run
	NODE_ENV=test make test-fast

test-fast: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^

test-fast-watch: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^ -w

test-watch:
	NODE_ENV=test karma start
