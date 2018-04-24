const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  moduleNameMapper: moduleNameMapper
}
