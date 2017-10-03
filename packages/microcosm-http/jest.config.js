const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir/build/'],
  moduleNameMapper: moduleNameMapper
}
