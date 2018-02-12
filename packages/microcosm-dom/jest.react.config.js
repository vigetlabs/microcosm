const { moduleNameMapper } = require('../../jest.config')
const isBundled = process.env.BUNDLED

module.exports = {
  setupTestFrameworkScriptFile: './test/engines/react.setup.js',
  setupFiles: ['raf/polyfill'],
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['build'],
  moduleNameMapper: Object.assign({}, moduleNameMapper, {
    '^microcosm-dom/react': `<rootDir>/${isBundled ? 'build' : 'src'}/react`
  })
}
