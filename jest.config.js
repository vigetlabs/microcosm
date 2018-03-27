const isBundled = process.env.BUNDLED

module.exports = {
  projects: [
    './packages/microcosm',
    './packages/microcosm-dom/jest.preact.config.js',
    './packages/microcosm-dom/jest.react.config.js',
    // TODO: This project needs to be updated with Microcosm 13.x changes
    // './packages/microcosm-graphql',
    './packages/microcosm-http'
  ],
  modulePathIgnorePatterns: ['example', 'build'],
  moduleNameMapper: {
    '^microcosm$': `<rootDir>/../microcosm/${isBundled ? 'build' : 'src'}`,
    '^microcosm-http$': `<rootDir>/../microcosm-http/src/http.js`,
    '^micromanage$': `<rootDir>/../micromanage/${isBundled ? 'build' : 'src'}`
  }
}
