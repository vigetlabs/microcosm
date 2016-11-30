# Microcosm Site

The Microcosm website draws from `../docs` and `./src/content` to
build pages. It is published to Github Pages here:

http://code.viget.com/microcosm/

## Setup

We use [pandoc](pandoc.org) to generate the site. This
needs to be installed. For OSX users:

```
brew install pandoc
```

## Run Locally

From the project root:

```
cd site
make server
```

## Publish

From the project root:

```
cd site
make publish
```
