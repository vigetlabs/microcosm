jsdoc=node_modules/.bin/jsdoc
conf=jsdoc/conf.json
microcosm=../microcosm

build:
	@ $(jsdoc) $(microcosm)/src -c $(conf)
	@ $(jsdoc) $(microcosm)/src -c $(conf) --package $(microcosm)/package.json
	@ echo "Built microcosm-www-next"

server: build
	@ php -S localhost:8000 -t build
	@ echo "microcosm-www-next is running at http://localhost:8000"

.PHONY: build
