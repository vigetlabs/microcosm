const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
