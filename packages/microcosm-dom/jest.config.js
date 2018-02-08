const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/setup.js',
  setupFiles: ['raf/polyfill'],
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['build'],
  moduleNameMapper: moduleNameMapper
}
