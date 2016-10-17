MAKEFLAGS ?= '-j 4'
BABEL := node_modules/.bin/babel
SCRIPTS := $(addprefix build/,$(shell find src bench -name '*.js*'))

all: javascript docs package.json

javascript: $(SCRIPTS)

build/%.js: %.js
	@ mkdir -p $(@D)
	@ $(BABEL) -c -s inline $< > $@
	@ echo "[+] $@"
	@ rsync -uraq build/src/ build/

docs: LICENSE.md README.md
	@ mkdir -p build
	@ cp $^ build/

package.json:
	@ mkdir -p build
	@ node -p 'p=require("./package");p.main="microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > build/package.json

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

bench: javascript
	@ node --expose-gc build/bench/history-performance
	@ node --expose-gc build/bench/dispatch-performance
	@ node --expose-gc build/bench/push-performance

clean:
	@ rm -rf {build/*}

.PHONY: all clean bench package.json documentation release prerelease
