SHELL   := /bin/bash
PATH    := node_modules/.bin:$(PATH)
MODULES := $(shell find src examples bench test -name '*.js*')

all: documentation package.json javascript
	@ rsync -uraq tmp/src/ dist/

javascript: tmp/js.cache

tmp/js.cache: $(MODULES)
	@ # Compile over all JavaScript modules
	@ babel -q -s inline -d $(@D) $(filter %.js %.jsx, $?)
	@ # Copy over anything else
	@ rsync -uraq $(filter-out %.js %.jsx, $?) $(@D)
	@ # Set a time stamp for the cache
	@ date > $@
	@ # Report work completed
	@ echo "Compiled $(words $?) files."

documentation: *.md docs
	@ mkdir -p dist/
	@ cp -R $^ dist/

lint: $(MODULES)
	@ eslint $^

package.json:
	@ node -p 'p=require("./package");p.main="microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > dist/package.json

release: clean all
	npm publish dist

prerelease: clean all
	npm publish dist --tag beta

test: lint javascript
	@ ava --fail-fast --tap | tap-dot

test-cov: lint javascript
	@ nyc --reporter html ava

bench: javascript
	@ node --expose-gc tmp/bench/tree-performance
	@ node --expose-gc tmp/bench/dispatch-performance
	@ node --expose-gc tmp/bench/push-performance

clean:
	@ rm -rf {tmp,dist}/*

.PHONY: all clean test test-coverage bench lint package.json documentation release prerelease
