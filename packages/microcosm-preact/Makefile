MAKEFLAGS += '-j 4'

all: build umd es docs

build: build/package.json
	@ ./bin/bundle --out=build

umd: build/package.json
	@ ./bin/bundle --out=build/umd --format=umd

es: build/package.json
	@ ./bin/bundle --out=build/es --format=es

docs:
	@ mkdir -p build
	@ cp -r CHANGELOG.md README.md LICENSE.md build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

release: clean all
	npm publish build

prerelease: clean all
	npm publish build --tag beta

clean:
	@ rm -rf build/*

watch-build:
	@ echo "[i] Rebuilding microcosm-preact..."
	@ make build
	@ echo "[+] Rebuilt microcosm-preact..."

watch:
	@ echo "Watching microcosm-preact..."
	@ fswatch -o src | xargs -n1 -I{} make watch-build

.PHONY: clean release prerelease all build umd es docs watch watch-build
