ROLLUP := node_modules/.bin/rollup
SCRIPTS := $(shell find src -name '*.js*')
MODULES = src/microcosm.js $(wildcard src/addons/*.js)

PROFILE = NODE_ENV=production node --expose-gc $(1)

all: javascript docs build/package.json

javascript: $(patsubst src/%,build/%,$(MODULES))

docs:
	@ mkdir -p build
	@ cp -r CHANGELOG.md README.md LICENSE.md docs build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

build/%.js: src/%.js $(SCRIPTS)
	@ mkdir -p $(@D)
	@ $(ROLLUP) -c rollup.config.js $< --output $@
	@ NODE_ENV=production $(ROLLUP) -c rollup.config.js $< --output build/$*.min.js

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

bench: javascript
	@ $(call PROFILE, bench/history-performance)
	@ $(call PROFILE, bench/dispatch-performance)
	@ $(call PROFILE, bench/push-performance)
	@ $(call PROFILE, bench/fork-performance)

clean:
	@ rm -rf build/*

.PHONY: clean bench release prerelease all javascript docs
