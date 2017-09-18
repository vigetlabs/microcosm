const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  modulePathIgnorePatterns: ['<rootDir/build/', '<rootDir>/example/'],
  moduleNameMapper: moduleNameMapper
}
