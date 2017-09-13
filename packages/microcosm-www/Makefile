MAKEFLAGS += "-j 4"

DOCS := $(patsubst ../microcosm/docs/%.md, public/%.html, $(shell find ../microcosm/docs -name "*.md"))
PAGES := $(patsubst src/pages/%.md, public/%.html, $(shell find src/pages -name "*.md"))

all: $(DOCS) $(PAGES) public/changelog.html

server: clean
	@ $(MAKE) all
	@ ./bin/serve

publish: clean
	@ ./bin/publish

clean:
	@ rm -rf $(PAGES) $(DOCS)

public/changelog.html: ../microcosm/CHANGELOG.md src/layouts/default.html
	@ ./bin/build-page $< $@ default

public/index.html: src/pages/index.md src/layouts/home.html
	@ ./bin/build-page $< $@ home

public/%.html: ../microcosm/docs/%.md src/layouts/default.html
	@ mkdir -p $(@D)
	@ ./bin/build-page $< $@ default

.PHONY: all server publish clean
