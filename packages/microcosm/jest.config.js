const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/setup.js',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
