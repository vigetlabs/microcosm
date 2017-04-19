ROLLUP := node_modules/.bin/rollup
SCRIPTS := $(shell find src -name '*.js*')
MODULES = src/microcosm.js $(wildcard src/addons/*.js)

PROFILE = NODE_ENV=production node --expose-gc $(1)
# Plain output files, with no frills. No assertions
COMPILED = $(patsubst src/%.js,build/%.js,$(MODULES))
# Strict mode output. These files include assertions
STRICT = $(patsubst src/%.js,build/strict/%.js,$(MODULES))
# Compressed output
MINIFIED = $(patsubst src/%.js,build/min/%.js,$(MODULES))

all: javascript docs

javascript: strict minified compiled

pretty:
	yarn run pretty

compiled: $(COMPILED) build/package.json

strict: $(STRICT) build/package.json
	@ cp build/package.json build/strict/package.json

minified: $(MINIFIED) build/package.json
	@ cp build/package.json build/min/package.json

docs:
	@ mkdir -p build
	@ cp -r CHANGELOG.md README.md LICENSE.md docs build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

build/min/%.js: src/%.js $(SCRIPTS)
	@ MINIFY=true $(ROLLUP) -c rollup.config.js $< --output $@
	@ echo $@
	@ gzip -c $@ | wc -c | tr -d '[:space:]'
	@ echo

build/strict/%.js: src/%.js $(SCRIPTS)
	@ STRICT=true $(ROLLUP) -c rollup.config.js $< --output $@

build/%.js: src/%.js $(SCRIPTS)
	@ $(ROLLUP) -c rollup.config.js $< --output $@

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

bench: compiled
	@ $(call PROFILE, bench/history-performance)
	@ $(call PROFILE, bench/dispatch-performance)
	@ $(call PROFILE, bench/push-performance)
	@ $(call PROFILE, bench/fork-performance)

clean:
	@ rm -rf build/*

.PHONY: clean bench release prerelease all docs
