const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleNameMapper: moduleNameMapper
}
