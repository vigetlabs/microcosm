const MICROCOSM_DIR = process.env.BUNDLED ? 'build/min' : 'src'

module.exports = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  modulePathIgnorePatterns: ['build', 'coverage', 'examples'],
  coveragePathIgnorePatterns: ['build', 'examples', 'test'],
  moduleNameMapper: {
    '.*?/src/(.*)': `<rootDir>/${MICROCOSM_DIR}/$1`
  }
}
