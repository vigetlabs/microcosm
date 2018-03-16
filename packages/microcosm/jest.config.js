const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/setup.js',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
