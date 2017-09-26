const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  setupFiles: ['raf/polyfill'],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
