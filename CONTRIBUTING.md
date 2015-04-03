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

This will host the demo at `http://localhost:8080`.

## Testing

Microcosm uses [Karma](https://karma-runner.github.io). You can run tests
with:

```bash
npm test
```

Be sure to check the `./coverage` folder to verify all code paths are
touched.

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
