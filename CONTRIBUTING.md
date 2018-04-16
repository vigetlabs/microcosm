# Contribution Guidelines

Thanks you for considering a contribution to Microcosm!

## Before Starting

Microcosm is built using tools written for
[nodejs](http://nodejs.org). We recommend installing Node with
[nvm](https://github.com/creationix/nvm). Dependencies are managed
through `package.json`.

You use the same node version we are developing with by running

```bash
nvm use
```

> You may need to run `nvm install` if you haven't installed the node version we require.

## Getting Started

All commands should be run using yarn. If you haven't switched to [yarn](https://yarnpkg.com/en/) yet, now's a great time!

> If you are familiar with npm then using yarn should be a breeze. You can keep using npm if you'd prefer but you will miss out on the safety and security of yarn

Microcosm must manage multiple projects. To do that, we use [Lerna](https://lernajs.io). After [installing Lerna globally](https://lernajs.io/#getting-started), setup the project with:

```bash
lerna bootstrap
```

This will install dependencies for all packages in this repo.

### Docs

Documentation found on the [Microcosm site](http://code.viget.com/microcosm) is generated from markdown files in the [docs section of the `microcosm` package](./packages/microcosm/docs).

> We would love your help in improving documentation. Get involved by creating a pull request addressing an issue with the label `documentation`, by creating a documentation issue, or contributing to the conversation on existing [issues](https://github.com/vigetlabs/microcosm/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation).

### Site

You may want to run what you see on [code.viget.com/microcosm](http://code.viget.com/microcosm) locally. To do so head over the [site section of this repo](./packages/microcosm-www).

## Prettier

We use [prettier](https://github.com/prettier/prettier) to ensure consistent style across all packages. Automated tests continually check that code formatting is consistent, failing the build if it is not. Make sure this doesn't happen by running:

```bash
yarn format
```

This will run `prettier` on all relevant fils in the repo.

## Testing

A few of our packages depend on the built output of other packages. For example, `microcosm-preact` depends on a production build of `microcosm`. When working locally, incrementally build all packages by running the `watch` command. 

First make sure you have fswatch:

```bash
brew install fswatch
```

Then execute:

```bash
yarn watch
```

Then in another terminal, run:

```bash
yarn test
```

This run tests for every package. That's a lot of tests! To reduce down the number of tests that execute, consider running the test command with a filter:

```bash
yarn test microcosm-preact
```

For test coverage:

```bash
yarn run test:cov
open ./coverage/index.html
```

> Be sure to check the `./coverage` folder to verify all code paths are touched.

## Deployment

The following steps are required to push a new release:

1. Update changelog
2. `yarn version <major,minor,patch>`
3. `git push --tags`
4. `make release`

Microcosm must first be compiled down to ES5 using Babel. The
following command will perform that task and deploy to NPM:

```bash
yarn run release
```

For release candidates, consider deploying to NPM using the `beta` tag
with:

```bash
make prerelease
```

### Reviews

All changes should be submitted through pull request. Ideally, at least two :+1:s should be given before a pull request is merge.
