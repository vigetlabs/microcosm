module.exports = {
  setupFiles: ['./test/setup.js'],
  modulePathIgnorePatterns: ['build', 'example'],
  coveragePathIgnorePatterns: ['build', 'examples', 'test'],
  moduleNameMapper: {
    '.*?microcosm$': '<rootDir>../microcosm/build/microcosm.js',
    '.*?microcosm/(.*)': '<rootDir>../microcosm/build/$1'
  }
}
