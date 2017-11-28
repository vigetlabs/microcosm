const isBundled = process.env.BUNDLED

module.exports = {
  projects: [
    './packages/microcosm',
    './packages/microcosm-preact',
    './packages/microcosm-graphql',
    './packages/microcosm-react-router',
    './packages/microcosm-http'
  ],
  modulePathIgnorePatterns: ['example', 'build'],
  moduleNameMapper: {
    '^microcosm(/.+|$)': `<rootDir>/../microcosm/${
      isBundled ? 'build/min' : 'src'
    }$1`,
    '^microcosm-preact$': `<rootDir>/../microcosm-preact/${
      isBundled ? 'build' : 'src'
    }`,
    '^microcosm-http$': `<rootDir>/../microcosm-http/src/http.js`
  }
}
