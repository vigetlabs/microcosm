const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir/build/', '<rootDir>/example/'],
  moduleNameMapper: moduleNameMapper
}
