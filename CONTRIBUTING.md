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
- Commas last, (enforced by `.eslintrc.json`)
- 2 spaces for indentation (no tabs) (enforced by `.editorconfig`)
- Prefer ' over ", use string interpolation (enforced by `.eslintrc.json`)
- 80 character line length (enforced by `.editorconfig`)

> We recommend using an [editorconfig](http://editorconfig.org/) and [eslint](http://eslint.org/) plugin during development to ensure standards are met.

### Reviews

All changes should be submitted through pull request. Ideally, at
least two :+1:s should be given before a pull request is merge.
