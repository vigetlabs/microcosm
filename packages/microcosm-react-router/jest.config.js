module.exports = {
  modulePathIgnorePatterns: ['es', 'lib'],
  coveragePathIgnorePatterns: ['build', 'test'],
  moduleNameMapper: {
    '.*?microcosm$': '<rootDir>../microcosm/build/microcosm.js',
    '.*?microcosm/(.*)': '<rootDir>../microcosm/build/$1'
  }
}
