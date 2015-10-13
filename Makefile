SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
NAME  := $(shell node -e 'console.log(require("./package.json").name)')
IN    := src
OUT   := dist
JS    := $(subst $(IN),$(OUT),$(shell find $(IN) -name '*.js*' ! -path '*/__tests__/*'))

.PHONY: clean deliverables test test-watch example bench

build: package.json README.md LICENSE.md docs deliverables es5
	@ make audit

docs:
	@ cp -rp $@ $^

deliverables:
	@ cp -rf $(IN) $(OUT)/$(IN)
	@ mkdir -p $(OUT)/addons
	@ babel -q -d $(OUT)/addons $(IN)/addons

es6:
	@ rollup -f cjs --sourcemap -e diode -i $(IN)/Microcosm.js -o $(OUT)/$(NAME).es6.js

es5: es6
	@ babel --input-source-map $(OUT)/$(NAME).es6.js.map $(OUT)/$(NAME).es6.js > $(OUT)/$(NAME).js

$(OUT):
	@ mkdir -p $(OUT)

%.md:
	cp -p $@ $^

package.json: $(OUT)
	@ node -p 'p=require("./package");p.main="$(NAME).js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $(OUT)/package.json

release: clean build
	npm publish $(OUT)

prerelease: clean build
	npm publish $(OUT) --tag beta

example:
	@ webpack-dev-server --config examples/webpack.config.js

clean:
	@ rm -rf $(OUT)

audit:
	@ echo "Gzipped Size:"
	@ NODE_ENV=production babel $(OUT)/$(NAME).js \
	| uglifyjs --mangle toplevel -c \
	| gzip -c \
	| wc -c

test:
	@ NODE_ENV=test karma start --single-run
	@ NODE_ENV=test make test-fast

test-fast: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^

test-fast-watch: $(shell find {src,examples} -name '*-test.js')
	@ mocha -R dot --compilers js:babel/register $^ -w

test-watch:
	NODE_ENV=test karma start

bench: es5
	@ node --expose-gc --trace-deopt benchmarks/tree-performance
	@ node --expose-gc --trace-deopt benchmarks/dispatch-performance
