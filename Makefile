MAKEFLAGS += '-j 4'

SHELL   := /bin/bash
PATH    := node_modules/.bin:$(PATH)
SCRIPTS := $(shell find src test examples -name '*.js') $(shell find src test examples -name '*.jsx')

build: package.json $(wildcard *.md) docs bundle

bundle: dist/index.js dist/addons/connect.js dist/addons/provider.js

docs: dist
	@ cp -rp $@ $^

dist/%.js: tmp/src/%.js javascript
	@ mkdir -p $(@D)
	@ rollup -m inline -f cjs $< > $@

dist:
	@ mkdir -p dist

%.md: dist
	@ cp -p $@ $<

lint: $(SCRIPTS)
	@ eslint $^

package.json: dist
	@ node -p 'p=require("./package");p.main="microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > dist/package.json

release: clean build
	npm publish dist

prerelease: clean build
	npm publish dist --tag beta

test: lint test-browser test-node

test-browser:
	@ NODE_ENV=test karma start

test-node:
	@ NODE_ENV=test mocha -R dot --compilers js:babel-register --recursive

bench: bundle
	@ node --expose-gc scripts/bench/tree-performance
	@ node --expose-gc scripts/bench/dispatch-performance
	@ node --expose-gc scripts/bench/push-performance

clean:
	@ rm -rf dist/*

.PHONY: clean deliverables test test-node test-browser example bench package.json javascript lint
