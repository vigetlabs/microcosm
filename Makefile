all: build strict min umd es docs

pretty:
	yarn run pretty

build: build/package.json
	@ ./scripts/bundle --out=build

strict: build/package.json
	@ ./scripts/bundle --out=build/strict --strict
	@ cp build/package.json build/strict

min: build/package.json
	@ ./scripts/bundle --out=build/min --minify

umd: build/package.json
	@ ./scripts/bundle --out=build/umd --format=umd

es: build/package.json
	@ ./scripts/bundle --out=build/es --format=es

docs:
	@ mkdir -p build
	@ cp -r README.md LICENSE build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

release: clean all
	yarn test:prod
	npm publish build

prerelease: clean all
	yarn test:prod
	npm publish build --tag beta

bench: build
	@ NODE_ENV=production node --expose-gc bench/history-performance
	@ NODE_ENV=production node --expose-gc bench/dispatch-performance
	@ NODE_ENV=production node --expose-gc bench/push-performance
	@ NODE_ENV=production node --expose-gc bench/fork-performance
	@ NODE_ENV=production node --expose-gc bench/compare-tree-performance

clean:
	@ rm -rf build/*

.PHONY: clean bench release prerelease all docs build strict min umd es
