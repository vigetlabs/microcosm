SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
NAME  := $(shell node -e 'console.log(require("./package.json").name)')
IN    := src
OUT   := dist

VPATH := $(OUT)

.PHONY: clean deliverables test test-fast test-browser test-watch example bench javascript package.json

build: package.json $(wildcard *.md) docs deliverables javascript

docs:
	@ cp -rp $@ $^

bundle: $(OUT)
	rollup -f cjs ./src/Microcosm.js > $(OUT)/microcosm.es6.js
	buble $(OUT)/microcosm.es6.js > $(OUT)/microcosm.js
	browserify $(OUT)/microcosm.js > $(OUT)/microcosm.build.js

$(OUT)/%.js: $(IN)/%.js
	@ mkdir -p $(@D)
	@ babel $< > $@
	@ echo "Compiled $@"

$(OUT)/%.jsx: $(IN)/%.jsx
	@ mkdir -p $(@D)
	@ babel $< > $@
	@ echo "Compiled $*.js"

deliverables: $(OUT)
	@ cp -rf $(IN) $(OUT)/$(IN)

javascript: $(subst $(IN),$(OUT),$(shell find ./src -name "*.js*"))

$(OUT):
	@ mkdir -p $(OUT)

%.md: $(OUT)
	cp -p $@ $^

package.json: $(OUT)
	@ node -p 'p=require("./package");p.main="Microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $(OUT)/package.json

release: clean build
	npm publish $(OUT)

prerelease: clean build
	npm publish $(OUT) --tag beta

example:
	@ webpack-dev-server --config examples/webpack.config.js

example-static:
	@ webpack --config examples/webpack.config.js

clean:
	@ rm -rf $(OUT)

test: test-browser test-node

test-browser:
	@ NODE_ENV=test karma start $(TEST_OPTIONS)

test-watch:
	@ make test-browser TEST_OPTIONS="--watch"

test-node: $(shell find {test,examples} -name '*-test.js')
	@ NODE_ENV=test mocha -R dot --compilers js:babel-register $(MOCHA_OPTIONS) test examples

test-node-watch: $(shell find {test,examples} -name '*-test.js')
	@ make test-node MOCHA_OPTIONS="-w"

bench: javascript
	@ node --expose-gc benchmarks/tree-performance
	@ node --expose-gc benchmarks/dispatch-performance
	@ node --expose-gc benchmarks/push-performance
