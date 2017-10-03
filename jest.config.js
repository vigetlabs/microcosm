const MICROCOSM_DIR = process.env.BUNDLED ? 'build/min' : 'src'

module.exports = {
  projects: [
    './packages/microcosm',
    './packages/microcosm-preact',
    './packages/microcosm-graphql',
    './packages/microcosm-react-router',
    './packages/microcosm-http'
  ],
  collectCoverageFrom: ['**/src/**/*.js', '!example/**/*.js'],
  modulePathIgnorePatterns: ['example', 'build'],
  moduleNameMapper: {
    '^microcosm(/.+|$)': `<rootDir>/../microcosm/${MICROCOSM_DIR}$1`
  }
}
