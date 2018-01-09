const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupFiles: ['raf/polyfill', './test/setup.js'],
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['build'],
  moduleNameMapper: moduleNameMapper
}
