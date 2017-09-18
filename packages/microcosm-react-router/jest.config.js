const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/es/'],
  moduleNameMapper: moduleNameMapper
}
