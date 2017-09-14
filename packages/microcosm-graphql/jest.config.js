module.exports = {
  watchPathIgnorePatterns: ['example'],
  moduleNameMapper: {
    '.*?microcosm$': '<rootDir>../microcosm/build/microcosm.js',
    '.*?microcosm/(.*)': '<rootDir>../microcosm/build/$1'
  }
}
