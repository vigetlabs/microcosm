MAKEFLAGS ?= '-j 4'
BABEL := node_modules/.bin/babel
SCRIPTS := $(addprefix tmp/,$(shell find src src -name '*.js*'))
VERSION := $$(node -p "require('./package').version")

all: javascript docs package.json
	@ echo [+] prepared v$(VERSION)

javascript: $(SCRIPTS)

tmp/%.js: %.js
	@ mkdir -p $(@D)
	@ $(BABEL) -c -s inline $< > $@
	@ echo [+] $(@F)
	@ rsync -uraq tmp/src/ build/

docs: LICENSE.md README.md
	@ mkdir -p build
	@ cp $^ build/
	@ echo [+] docs

package.json:
	@ mkdir -p build
	@ node -p 'p=require("./package");p.main="microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > build/package.json
	@ echo [+] package.json

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

bench: javascript
	@ node --expose-gc tmp/bench/history-performance
	@ node --expose-gc tmp/bench/dispatch-performance
	@ node --expose-gc tmp/bench/push-performance

clean:
	@ rm -rf build/*

.PHONY: all clean bench package.json documentation release prerelease
