const config = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  modulePathIgnorePatterns: ['build', 'coverage', 'examples'],
  coveragePathIgnorePatterns: ['build', 'examples', 'test'],
  moduleNameMapper: {}
}

if (process.env.BUNDLED) {
  config.moduleNameMapper['.*?/src/(.*)'] = '<rootDir>/build/min/$1'
  config.testPathIgnorePatterns.push('unit/key-path', 'unit/registration')
}

module.exports = config
