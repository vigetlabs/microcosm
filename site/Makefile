DOCS  := $(patsubst ../docs/%.md, public/%.html, $(shell find ../docs -name "*.md"))
PAGES := $(patsubst src/content/%.md, public/%.html, $(shell find src/content -name "*.md"))

BASE_URL ?= "http://code.viget.com/microcosm/"

MARKDOWN = pandoc -s --section-divs --smart --from=markdown-implicit_figures --template=src/layouts/$(3).html $(1) > $(2) --var=base_url:$(BASE_URL)

all: $(DOCS) $(PAGES)

server:
	@ BASE_URL=/ $(MAKE) clean all
	@ BASE_URL=/ ./scripts/serve

publish: clean all
	@ ./scripts/publish

clean:
	@ rm -rf $(PAGES) $(DOCS)

public/index.html: src/content/index.md src/layouts/home.html
	@ $(call MARKDOWN,$<,$@,home)
	@ echo [+] $@

public/%.html: ../docs/%.md src/layouts/default.html
	@ mkdir -p $(@D)
	@ $(call MARKDOWN,$<,$@,default)
	@ echo [+] $@

.PHONY: all server publish clean
