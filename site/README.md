# Microcosm Site

- [Introduction](#introduction)
- [Setup](#setup)
- [Run Locally](#run-locally)
- [Publish](#publish)

## Introduction

The Microcosm website is built using markdown files, html templates, a stylesheet, and a few image assets. It is published using Github pages on the `gh-pages` branch. Check out the live site here: http://code.viget.com/microcosm/

> For more information on Gihub Pages got here: https://pages.github.com/.

Here is a brief overview of everything you'll find in the `site` folder:

### public

The generated site will live here after running (we'll go over generating the site and serving the site locally in the next section.) With the exception of the `assets` folder you should never edit these files, they will be overwritten when regenerating the site and aren't in source control.

### scripts

The `Makefile` uses these files to generate the html files in the `public` folder, to serve the site locally, and to publish the site to Github pages.

### src

The site is generated using the markdown files in `./src/pages` and the html templates in `.src/layouts` by Pandoc (see [setup section below](#setup)).

> Note that markdown files can also be found in `../docs` outside the site folder.

### Makefile

A [Makefile](https://en.wikipedia.org/wiki/Makefile) provides a few easy commands for building, serving, and publishing the site. To keep things simple there are two main ones you will most likely need:

- `make server` which lets you run the site locally on `localhost:4000`
- `make publish` which bundles the site, puts the files on the `gh-pages` branch, and pushes them to Github

## Setup

We use [pandoc](pandoc.org) to generate the site. This needs to be installed. For OS X users:

```
brew install pandoc
```

## Run Locally

From the project root:

```
cd site
make server
```

The html files will be generated (or updated) into `./public` and a server will be started running on `localhost:4000`. Point your browser there to see the site. Changes to files in `./src` or any `.md` file will trigger a live reload on the site (no need to hit refresh).

> To see what is going on under the hood look at the `Makefile` and at the `./scripts/serve` script. If you are not familiar with browser-sync check out [their website](https://www.browsersync.io/) for details.

## Publish

Publishing to `http://code.viget.com/microcosm` can only be done by core contributors with merging privileges. If this is you then publishing is straightforward, from the project root:

```
cd site
make publish
```

> To see what is going on under the hood look at the `Makefile` and at the `./scripts/publish` script. The script will force push the site to the `gh-pages` branch which will publish the site to `http://code.viget.com/microcosm`
