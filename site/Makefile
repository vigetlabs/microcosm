SHELL := /bin/bash
PATH  := ../node_modules/.bin:$(PATH)

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
	browser-sync start --files "dist/css/*.css" "dist/*.html" --server dist

dist:
	@mkdir -p dist/{images,css}

dist/%.svg: src/%.svg
	svgo $^ $@

dist/%.png: src/%.png
	cat $^ > $@

dist/css/%.css: src/scss/%.scss
	node-sass $^ > $@

dist/%.html: src/%.html
	swig render $^ -j $(DATA) > $@
