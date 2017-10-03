const { moduleNameMapper } = require('../../jest.config')

module.exports = {
  setupFiles: ['./test/setup.js'],
  moduleNameMapper: moduleNameMapper
}
