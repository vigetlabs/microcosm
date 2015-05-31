BIN     = $$(npm bin)
BABEL   = $(BIN)/babel
KARMA   = $(BIN)/karma
WEBPACK = $(BIN)/webpack
DIST    = dist
JS      = $(shell find src -name '*.js' ! -path '*/__tests__/*')

.PHONY: clean test test-watch release example website
.FORCE: javascript-min

build: package.json README.md LICENSE.md docs javascript javascript-min

$(DIST):
	@mkdir -p $(DIST)

%.md: $(DIST)
	cp $@ $^

package.json: $(DIST)
	@node -p 'p=require("./package");p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $(DIST)/package.json

docs: $(DIST)
	cp -r $@ $^

javascript: $(DIST)
	@$(BABEL) -d $^ $(JS)

javascript-min: javascript
	@NODE_ENV=production \
	$(WEBPACK) -p dist/src/Microcosm.js $(DIST)/microcosm.build.js \
	--devtool sourcemap --output-library-target commonjs2 \
	--optimize-minimize --optimize-occurence-order --optimize-dedupe


release: clean build
	npm publish $(DIST)

example:
	@$(BIN)/webpack-dev-server \
	--config examples/webpack.config.js \
	--content-base examples \
	--publicPath assets \
	--historyApiFallback true

clean:
	@rm -rf $(DIST)

audit:
	@echo "Compressed Size:"
	@cat $^ | wc -c
	@echo "Gzipped Size:"
	@gzip -c $^ | wc -c

website:
	git subtree push --prefix site origin gh-pages

test:
	NODE_ENV=test $(KARMA) start --single-run

test-watch:
	NODE_ENV=test $(KARMA) start
