# Installation

1. [Up and running](#up-and-running)
2. [Strict mode](#strict-mode)
3. [Optional dependencies](#optional-dependencies)

## Up and running

The easiest way to grab Microcosm is
through [npm](https://www.npmjs.com/package/microcosm):

```bash
npm install --save microcosm
```

From there, we recommend using a tool
like [Webpack](https://webpack.js.org/) to bundle your code and pull
in dependencies from `npm`.

If you have never heard of Webpack,
fantastic! Now's a great time to check it
out. [Webpack's excellent getting started guide](https://webpack.js.org/guides/get-started/) covers
everything you need to know before getting started.

## Strict mode

Microcosm ships with a "strict mode", this is a special version of
Microcosm that includes development-only assertions. These help to
avoid common mistakes and ensure correct usage of Microcosm
APIs. **Assertions do not ship with the standard version of Microcosm.
They are totally opt in.**

Enable assertions by pointing to `microcosm/strict` in your application:

```javascript
import Microcosm from 'microcosm/strict/microcosm.js'
```

However, this is hardly ideal. We recommend using
a
[Webpack alias](https://webpack.js.org/configuration/resolve/#resolve-alias) to
automatically point to the strict version of Microcosm whenever you
import it:

```javascript
// webpack.config.js
module.exports = {
  // ...
  resolve: {
    alias: {
      "microcosm$": "microcosm/strict/microcosm.js",
      "microcosm/addons/$": "microcosm/strict/addons/",
    }
  }
  // ...
}
```

### How do I remove assertions in production?

We recommend switching a Webpack alias between environments. Drawing
from the prior example:

```javascript
// webpack.config.js
var isProduction = process.env.NODE_ENV !== 'development'

module.exports = {
  // ...
  resolve: {
    alias: {
      "microcosm$": isProduction ? 'microcosm' : "microcosm/strict/microcosm.js",
      "microcosm/addons/$": isProduction ? 'microcosm/addons/' : "microcosm/strict/addons/",
    }
  }
  // ...
}
```

### Optional dependencies

Microcosm actions can be described as generators. This is a new
JavaScript feature available in JS2015, which does not have wide
support.

**This is an advanced feature. There is no need to include a polyfill
for generators if you do not use them.** We recommend
using [Babel](https://babeljs.io) with
the [regenerator](https://github.com/facebook/regenerator) polyfill
available
through [babel-polyfill](https://babeljs.io/docs/usage/polyfill/).
