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

> You may need to run `nvm install` if you haven't installed the node version on `.nvmrc`

## Getting Started

All commands should be run using yarn. If you haven't switched to [yarn](https://yarnpkg.com/en/) yet, now's a great time!

> If you are familiar with npm then using yarn should be a breeze. You can keep using npm if you'd prefer but you will miss out on the safety and security of yarn

You can install dependencies with:

```bash
yarn install
```

### Examples

The [examples section](examples) showcase Microcosm features. These may be helpful as you develop new features or improve existing ones. Check out the [examples section of this repo](examples) to get started running the examples.

### Docs

Documentation found on the [Microcosm site](http://code.viget.com/microcosm) is generated from markdown files in the [docs section](docs).

> We would love your help in improving documentation. Get involved by creating a pull request addressing an issue with the label `documentation`, by creating a documentation issue, or contributing to the conversation on existing [issues](https://github.com/vigetlabs/microcosm/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation).

### Site

You may want to run what you see on [code.viget.com/microcosm](http://code.viget.com/microcosm) locally. To do so head over the [site section of this repo](site).

## Prettier

We are using [prettier](https://github.com/prettier/prettier) combined with [eslint](http://eslint.org/) to keep formatting and format linting easy. We do that by running:

```bash
yarn run pretty
```

or

```bash
make pretty
```

These will first run `prettier` to format our code and then run `eslint --fix` to make additional style changes and fixes.

### Things to note about the prettier/eslint combo

We are defaulting to prettier's opinions on some things (the ones it forces us to). Most notably single quotes. Prettiers **will** use double quotes (even in single quote mode) when it is "prettier" to do so.

ie:
```javascript
// prettier will do this (what we chose to do)
"I am using double quotes because it's prettier"

// eslint --fix would do this
'I am using single quotes because it\'s eslint --fix'
```

We are letting this happen for two reasons:

1. Write whatever you want, prettier will fix it, that's the point
2. Our `yarn run lint` task would error out if we did a `eslint --fix`. There is no way to turn change prettier's behaviour but we can turn off the offending eslint rule

## Testing

```bash
yarn test
```

For test coverage:

```bash
yarn run test:cov
open ./coverage/index.html
```

> Be sure to check the `./coverage` folder to verify all code paths are
touched.

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

## Conventions

**Consider master unsafe**, use [`npm`](https://www.npmjs.com/package/microcosm) for the latest stable version.

### Javascript

Microcosm uses ES6 Javascript (compiled using [Babel](babeljs.io)). As
for style:

- No semicolons (enforced by `.eslintrc.json`)
- 2 spaces for indentation (no tabs) (enforced by `.editorconfig`)
- Prefer ' over ", use string interpolation (enforced by `.eslintrc.json`)
- 80 character line length (enforced by `.editorconfig`)

> We recommend using an [editorconfig](http://editorconfig.org/), a [eslint](http://eslint.org/) plugin, and [prettier](https://github.com/prettier/prettier) integration for your editor during development to ensure standards are met.

### Reviews

All changes should be submitted through pull request. Ideally, at
least two :+1:s should be given before a pull request is merge.
