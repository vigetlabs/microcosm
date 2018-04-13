const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  collectCoverageFrom: ['src/**/*.js'],
  moduleNameMapper: moduleNameMapper
}
