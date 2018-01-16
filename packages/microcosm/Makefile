all: build strict min umd es docs

build: build/package.json
	@ ./bin/bundle --out=build

strict: build/package.json
	@ ./bin/bundle --out=build/strict --strict
	@ cp build/package.json build/strict

min: build/package.json
	@ ./bin/bundle --out=build/min --minify
	@ cp build/package.json build/min

umd: build/package.json
	@ ./bin/bundle --out=build/umd --format=umd

es: build/package.json
	@ ./bin/bundle --out=build/es --format=es
	@ cp build/package.json build/es

docs:
	@ mkdir -p build
	@ cp -r README.md LICENSE build

build/package.json: package.json
	@ mkdir -p build
	@ node -p 'p=require("./package");p.main="./index.js";p.private=p.scripts=p.jest=p.devDependencies=undefined;JSON.stringify(p,null,2)' > $@

release: clean all
	@ npm publish build

prerelease: clean all
	@ npm publish build --tag beta

bench: min
	#	@ NODE_ENV=production node --expose-gc bench/history-performance
	# @ NODE_ENV=production node --expose-gc bench/dispatch-performance
	@ NODE_ENV=production node --expose-gc bench/push-performance
	# @ NODE_ENV=production node --expose-gc bench/fork-performance

clean:
	@ rm -rf build/*

watch-build:
	@ echo "[i] Rebuilding microcosm..."
	@ make build
	@ echo "[+] Rebuilt microcosm..."

watch:
	@ echo "Watching microcosm..."
	@ fswatch -o src | xargs -n1 -I{} make watch-build

.PHONY: clean bench release prerelease all docs build strict min umd es watch watch-build
