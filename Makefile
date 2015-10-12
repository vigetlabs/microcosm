SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
IN    := src
OUT   := dist
JS    := $(subst $(IN),$(OUT),$(shell find $(IN) -name '*.js*' ! -path '*/__tests__/*'))

.PHONY: clean test test-watch release example website bench
.FORCE: javascript-min

build: package.json README.md LICENSE.md docs javascript-min
	@ make audit

javascript: $(JS)

$(OUT):
	@ mkdir -p $(OUT)

%.md: $(OUT)
	cp $@ $^

package.json: $(OUT)
	@ node -p 'p=require("./package");p.main="Microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $(OUT)/package.json

docs: $(OUT)
	cp -r $@ $^

$(OUT)/%.js: $(IN)/%.js
	@ mkdir -p $(@D)
	@ babel --plugins babel-plugin-unassert $< > $(OUT)/$*.js
	@ echo "compiled $*.js"

$(OUT)/%.jsx: $(IN)/%.jsx
	@ mkdir -p $(@D)
	@babel $< > $(OUT)/$*.js
	@ echo "compiled $*.js"

javascript-min: javascript
	NODE_ENV=production \
	webpack -p $(OUT)/Microcosm.js $(OUT)/microcosm.build.js \
	--devtool sourcemap --output-library-target commonjs2 \
	--optimize-minimize --optimize-occurence-order --optimize-dedupe

release: clean build
	npm publish $(OUT)

prerelease: clean build
	npm publish $(OUT) --tag beta

example:
	@ webpack-dev-server \
		--config examples/webpack.config.js \
		--content-base examples \
		--publicPath assets \
		--historyApiFallback true

site:
	make -C site

clean:
	@ rm -rf $(OUT)

audit:
	@ echo "Compressed Size:"
	@ cat $(OUT)/microcosm.build.js | wc -c
	@ echo "Gzipped Size:"
	@ gzip -c $(OUT)/microcosm.build.js | wc -c

test:
	@ echo "Testing browsers..."
	@ NODE_ENV=test karma start --single-run
	@ echo "Testing node..."
	@NODE_ENV=test make test-fast

test-fast: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^

test-fast-watch: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^ -w

test-watch:
	NODE_ENV=test karma start

bench: javascript
	@ node --expose-gc --trace-deopt benchmarks/tree-performance
	@ node --expose-gc --trace-deopt benchmarks/dispatch-performance
