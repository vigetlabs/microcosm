const config = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  moduleDirectories: ['node_modules', '.'],
  modulePathIgnorePatterns: [
    'build',
    'coverage',
    'examples',
    'site',
    'new_site'
  ],
  coveragePathIgnorePatterns: ['test', 'examples'],
  testPathIgnorePatterns: ['node_modules'],
  moduleNameMapper: {}
}

if (process.env.BUNDLED) {
  config.moduleNameMapper['.*?/src/(.*)'] = '<rootDir>/build/min/$1'
  config.testPathIgnorePatterns.push('unit/key-path', 'unit/registration')
}

module.exports = config
