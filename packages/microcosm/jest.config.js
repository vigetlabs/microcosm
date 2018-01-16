const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/setup.js',
  setupFiles: ['raf/polyfill'],
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
