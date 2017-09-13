module.exports = {
  verbose: true,
  projects: [
    '<rootDir>/packages/microcosm',
    '<rootDir>/packages/microcosm-preact'
  ],
  testPathIgnorePatterns: ['build', 'examples', 'example', 'node_modules'],
  roots: ['<rootDir>/packages/microcosm', '<rootDir>/packages/microcosm-preact']
}
