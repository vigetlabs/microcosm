const isBundled = process.env.BUNDLED

module.exports = {
  testEnvironment: 'node',
  projects: [
    './packages/microcosm',
    './packages/microcosm-dom',
    './packages/microcosm-graphql',
    './packages/microcosm-http'
  ],
  modulePathIgnorePatterns: ['example', 'build'],
  moduleNameMapper: {
    '^microcosm$': `<rootDir>/../microcosm/${isBundled ? 'build/min' : 'src'}`,
    '^microcosm-dom(.*)$': `<rootDir>/../microcosm-dom/${
      isBundled ? 'build' : 'src'
    }$1`,
    '^microcosm-http$': `<rootDir>/../microcosm-http/src/http.js`
  }
}
