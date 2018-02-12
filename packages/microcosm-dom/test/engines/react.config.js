const { moduleNameMapper } = require('../../jest.config')
const isBundled = process.env.BUNDLED

module.exports = {
  rootDir: '../../',
  setupTestFrameworkScriptFile: './test/engines/react.setup.js',
  setupFiles: ['raf/polyfill'],
  moduleNameMapper: Object.assign({}, moduleNameMapper, {
    '^microcosm-dom/react': `<rootDir>/${isBundled ? 'build' : 'src'}/react`
  })
}
