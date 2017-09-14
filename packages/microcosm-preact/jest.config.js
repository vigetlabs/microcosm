module.exports = {
  setupFiles: ['./test/setup.js'],
  moduleDirectories: ['node_modules', '.'],
  modulePathIgnorePatterns: ['build', 'coverage', 'example'],
  coveragePathIgnorePatterns: ['test', 'example'],
  moduleNameMapper: {
    '.*?microcosm$': '<rootDir>../microcosm/build/microcosm.js',
    '.*?microcosm/(.*)': '<rootDir>../microcosm/build/$1'
  }
}
