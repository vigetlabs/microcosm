MAKEFLAGS += "-j 4"

DOCS := $(patsubst ../docs/%.md, public/%.html, $(shell find ../docs -name "*.md"))
PAGES := $(patsubst src/pages/%.md, public/%.html, $(shell find src/pages -name "*.md"))

all: $(DOCS) $(PAGES) public/changelog.html

server: clean
	@ $(MAKE) all
	@ ./scripts/serve

publish: clean
	@ ./scripts/publish

clean:
	@ rm -rf $(PAGES) $(DOCS)

public/changelog.html: ../CHANGELOG.md src/layouts/default.html
	@ ./scripts/build-page $< $@ default
	@ echo [+] $@

public/index.html: src/pages/index.md src/layouts/home.html
	@ ./scripts/build-page $< $@ home
	@ echo [+] $@

public/%.html: ../docs/%.md src/layouts/default.html
	@ mkdir -p $(@D)
	@ ./scripts/build-page $< $@ default
	@ echo [+] $@

.PHONY: all server publish clean
