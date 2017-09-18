const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupFiles: ['./test/setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/example/'],
  moduleNameMapper: moduleNameMapper
}
