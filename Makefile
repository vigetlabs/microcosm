SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
NAME  := $(shell node -e 'console.log(require("./package.json").name)')
IN    := src
OUT   := dist
JS    := $(subst $(IN),$(OUT),$(shell find $(IN) -name '*.js*' ! -path '*/__tests__/*'))

.PHONY: clean deliverables test test-watch example bench javascript

build: package.json $(wildcard *.md) docs deliverables javascript

docs:
	@ cp -rp $@ $^

deliverables: $(OUT)
	@ cp -rf $(IN) $(OUT)/$(IN)

javascript: $(OUT)
	@ babel -q -d $(OUT) $(IN)

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

clean:
	@ rm -rf $(OUT)

test:
	@ NODE_ENV=test karma start --single-run
	@ NODE_ENV=test make test-fast

test-fast: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^

test-fast-watch: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^ -w

test-watch:
	NODE_ENV=test karma start

bench: javascript
	@ node --expose-gc --trace-deopt benchmarks/tree-performance
	@ node --expose-gc --trace-deopt benchmarks/dispatch-performance
