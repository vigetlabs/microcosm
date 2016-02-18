# Contribution Guidelines

Thanks you for considering a contribution to Microcosm!

Microcosm is built using tools written for
[nodejs](http://nodejs.org). We recommend installing Node with
[nvm](https://github.com/creationix/nvm). this also means that
dependencies are managed with an [`npm`](https://npmjs.org) `package.json`
file.

You can install dependencies with:

```bash
npm install
```

## Running

A production build can be built by running:

```bash
npm run prepublish
```

However most of the time developing with Microcosm, you will want
to reference the example app:

```bash
npm start
```

This will host a web server with all examples at `http://localhost:4000`.

## Testing

The fastest way to get immediate feedback is to test against node:

```bash
npm run test:fast
```

This will test the core Microcosm modules, however it won't cover
addons such as Connect and Provider. These modules require a
browser. To perform a complete run of all tests, run:

```bash
npm test
```

Be sure to check the `./coverage` folder to verify all code paths are
touched.

## Deployment

Microcosm must first be compiled down to ES5 using Babel. The
following command will perform that task and deploy to NPM:

```bash
make release
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
for style, shoot for:

- No semicolons
- Commas last,
- 2 spaces for indentation (no tabs)
- Prefer ' over ", use string interpolation
- 80 character line length

### Testing

Additionally, we aspire for 100% code coverage. However 100% code
coverage is not a foolproof indicator of good testing. Tests that
cover as much surface area as possible (for the sake of coverage)
should be avoided. This is a much softer measure than a style guide,
and will fall to code review for enforcement.

### Reviews

All changes should be submitted through pull request. Ideally, at
least two :+1:s should be given before a pull request is merge.
