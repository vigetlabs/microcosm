BIN     = $$(npm bin)
BABEL   = $(BIN)/babel
KARMA   = $(BIN)/karma
WEBPACK = $(BIN)/webpack

.PHONY: clean test test-watch build package.json javascript release example javascript-min

build:
	@make clean
	@make package.json
	@make documentation
	@make javascript
	@make audit

javascript-min: dist/src/Microcosm.js
	@$(WEBPACK) -p $^ dist/microcosm.build.js \
	--devtool sourcemap --output-library-target commonjs2

javascript: $(shell find src -name '*.js' ! -path '*/__tests__/*')
	@mkdir -p dist
	@$(BABEL) -d dist $^
	@make javascript-min

package.json:
	@mkdir -p dist
	@node -p 'p=require("./package");p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > dist/package.json

documentation: README.md LICENSE.md docs
	@mkdir -p dist
	cp -r $^ dist

release:
	make build
	npm publish dist

example:
	node example/server

clean:
	@rm -rf dist

audit: dist/microcosm.build.js
	@echo "Compressed Size:"
	@cat $^ | wc -c
	@echo "Gzipped Size:"
	@gzip -c $^ | wc -c

test:
	NODE_ENV=test $(KARMA) start --single-run

test-watch:
	NODE_ENV=test $(KARMA) start
