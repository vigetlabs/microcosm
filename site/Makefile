MAKEFLAGS += '-j 4'

DOCS := $(patsubst ../docs/%.md, public/%.html, $(shell find ../docs -name "*.md"))
PAGES := $(patsubst src/content/%.md, public/%.html, $(shell find src/content -name "*.md"))

OPTIONS = -s --smart --from=markdown-implicit_figures --var=base_url:$(BASE_URL)
MARKDOWN = pandoc $(OPTIONS) --template=src/layouts/$(3).html $(1) > $(2)

all: $(DOCS) $(PAGES) public/changelog.html

server: clean
	@ $(MAKE) all
	@ ./scripts/serve

publish:
	@ ./scripts/publish

clean:
	@ rm -rf $(PAGES) $(DOCS)

public/changelog.html: ../CHANGELOG.md src/layouts/default.html
	@ $(call MARKDOWN,$<,$@,default)
	@ echo [+] $@

public/index.html: src/content/index.md src/layouts/home.html
	@ $(call MARKDOWN,$<,$@,home)
	@ echo [+] $@

public/%.html: ../docs/%.md src/layouts/default.html
	@ mkdir -p $(@D)
	@ $(call MARKDOWN,$<,$@,default)
	@ echo [+] $@

.PHONY: all server publish clean
