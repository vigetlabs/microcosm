BABEL := node_modules/.bin/babel
SCRIPTS := $(shell find src bench -name '*.js*')

all: javascript docs package.json

javascript: $(SCRIPTS)
	@ echo "Compiling $(words $^) modules..."
	@ $(BABEL) -c -q -s inline -d tmp $^
	@ rsync -uraq tmp/src/ dist/

docs: LICENSE.md README.md
	@ rsync -uaq $^ dist/

package.json:
	@ node -p 'p=require("./package");p.main="microcosm.js";p.private=undefined;p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > dist/package.json

release: clean all
	npm publish dist

prerelease: clean all
	npm publish dist --tag beta

bench: javascript
	@ node --expose-gc tmp/bench/tree-performance
	@ node --expose-gc tmp/bench/dispatch-performance
	@ node --expose-gc tmp/bench/push-performance

clean:
	@ rm -rf {tmp,dist}

.PHONY: all clean bench package.json documentation release prerelease
