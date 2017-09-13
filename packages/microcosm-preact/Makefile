BABEL := node_modules/.bin/babel
MODULES = $(wildcard src/*.js)

all: javascript docs build/package.json

javascript: $(patsubst src/%,build/%,$(MODULES))

docs:
	@ mkdir -p build
	@ cp -r CHANGELOG.md README.md LICENSE.md build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

build/%.js: src/%.js $(MODULES)
	@ mkdir -p $(@D)
	@ $(BABEL) $< > $@

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

clean:
	@ rm -rf build/*

.PHONY: clean release prerelease all javascript docs
