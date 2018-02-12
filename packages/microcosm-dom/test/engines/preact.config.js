const { moduleNameMapper } = require('../../jest.config')
const isBundled = process.env.BUNDLED

module.exports = {
  rootDir: '../../',
  setupTestFrameworkScriptFile: './test/engines/preact.setup.js',
  setupFiles: ['preact-compat'],
  moduleNameMapper: Object.assign({}, moduleNameMapper, {
    '^react$': 'preact-compat',
    '^react-dom$': 'preact-compat',
    '^microcosm-dom/react': `<rootDir>/${isBundled ? 'build' : 'src'}/preact`
  })
}
