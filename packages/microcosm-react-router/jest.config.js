const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  modulePathIgnorePatterns: ['lib', 'es'],
  moduleNameMapper: moduleNameMapper
}
