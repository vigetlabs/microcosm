const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupFiles: ['./test/setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: moduleNameMapper,
  modulePathIgnorePatterns: ['build']
}
