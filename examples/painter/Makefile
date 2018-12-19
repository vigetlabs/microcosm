start:
	@ $$(npm bin)/webpack-dev-server --config ../webpack.config.js --mode=development

build: clean
	@ $$(npm bin)/webpack -p --config ../webpack.config.js --env=production --mode=production
	@ cp public/*.css build/

clean:
	@ rm -rf build/*

.PHONY: start build clean
