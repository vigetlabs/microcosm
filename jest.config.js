const isBundled = process.env.BUNDLED

module.exports = {
  testEnvironment: 'node',
  projects: [
    './packages/microcosm',
    './packages/microcosm-preact',
    './packages/microcosm-react',
    './packages/microcosm-graphql',
    './packages/microcosm-react-router',
    './packages/microcosm-http'
  ],
  modulePathIgnorePatterns: ['example', 'build'],
  moduleNameMapper: {
    '^microcosm$': `<rootDir>/../microcosm/${isBundled ? 'build/min' : 'src'}`,
    '^microcosm-preact$': `<rootDir>/../microcosm-preact/${
      isBundled ? 'build' : 'src'
    }`,
    '^microcosm-react$': `<rootDir>/../microcosm-react/${
      isBundled ? 'build' : 'src'
    }`,
    '^microcosm-http$': `<rootDir>/../microcosm-http/src/http.js`
  }
}
