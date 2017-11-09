const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupTestFrameworkScriptFile: './test/helpers/setup.js',
  setupFiles: ['raf/polyfill'],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/helpers/"],
  moduleNameMapper: moduleNameMapper
}
