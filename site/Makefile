DOCS  := $(shell find ../docs -name *.md)
PAGES := $(patsubst ../docs/%.md, public/%.html, $(DOCS))

MARKDOWN = pandoc -s --section-divs --smart --template=src/layouts/$(or $(3),default).html $(1) public/manifest.yaml > $(2)

all: $(PAGES)

server: all
	@ ./scripts/serve

public/index.html: src/content/index.md src/layouts/home.html
	@ $(call MARKDOWN,$<,$@,home)
	@ echo [+] $@

public/%.html: ../docs/%.md src/layouts/default.html
	@ mkdir -p $(@D)
	@ $(call MARKDOWN,$<,$@)
	@ echo [+] $@
