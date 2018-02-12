const { moduleNameMapper } = require('../../jest.config')
const isBundled = process.env.BUNDLED

module.exports = {
  setupTestFrameworkScriptFile: './test/engines/preact.setup.js',
  setupFiles: ['preact-compat'],
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['build'],
  moduleNameMapper: Object.assign({}, moduleNameMapper, {
    '^react$': 'preact-compat',
    '^react-dom$': 'preact-compat',
    '^microcosm-dom/react': `<rootDir>/${isBundled ? 'build' : 'src'}/preact`
  })
}
