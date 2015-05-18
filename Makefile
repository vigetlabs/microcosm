BIN     = $$(npm bin)
BABEL   = $(BIN)/babel
KARMA   = $(BIN)/karma
WEBPACK = $(BIN)/webpack
DIST    = dist
JS      = $(shell find src -name '*.js' ! -path '*/__tests__/*')

.PHONY: clean test test-watch release example
.FORCE: javascript-min

build: package.json README.md LICENSE.md docs javascript javascript-min
	make audit

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
	@$(WEBPACK) -p src/microcosm.js $(DIST)/microcosm.build.js \
	--devtool sourcemap --output-library-target commonjs2


release: clean build
	npm publish $(DIST)

example:
	node example/server

clean:
	@rm -rf $(DIST)

audit: $(DIST)/microcosm.build.js
	@echo "Compressed Size:"
	@cat $^ | wc -c
	@echo "Gzipped Size:"
	@gzip -c $^ | wc -c

test:
	NODE_ENV=test $(KARMA) start --single-run

test-watch:
	NODE_ENV=test $(KARMA) start
