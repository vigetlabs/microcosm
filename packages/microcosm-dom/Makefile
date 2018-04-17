all: build docs

build: build/package.json
	@ ./bin/bundle --format cjs --out build
	@ ./bin/bundle --format umd --out build/umd

docs:
	@ mkdir -p build
	@ cp -r CHANGELOG.md README.md LICENSE build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

clean:
	@ rm -rf build/*

.PHONY: clean release prerelease all build docs
