BIN  = $$(npm bin)
SWIG = $(BIN)/swig
SASS = $(BIN)/node-sass
SVGO = $(BIN)/svgo
SYNC = $(BIN)/browser-sync
DATA = ../package.json

stylesheets = dist/css/style.css
images      = $(shell find src/images -type f | sed s/src/dist/)
templates   = $(shell find src -type f -name "*.html" | sed s/src/dist/)

website: dist $(images) $(stylesheets) $(templates)

install:
	@npm install --ignore-scripts
	@npm test

watch:
	@echo "Watching src for changes..."
	@fswatch -0 src | xargs -0 -n1 -I{} make -j8 &\
	$(SYNC) start --files "dist/css/*.css" "dist/*.html" --server dist

dist:
	@mkdir -p dist/{images,css}

dist/%.svg: src/%.svg
	$(SVGO) $^ $@

dist/%.png: src/%.png
	cat $^ > $@

dist/css/%.css: src/scss/%.scss
	$(SASS) $^ > $@

dist/%.html: src/%.html
	$(SWIG) render $^ -j $(DATA) > $@
