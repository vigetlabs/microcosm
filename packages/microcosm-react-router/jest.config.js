const MICROCOSM_DIR = process.env.BUNDLED ? 'build/min' : 'src'

module.exports = {
  coveragePathIgnorePatterns: ['build', 'test'],
  moduleNameMapper: {
    '.*?microcosm(/.+|$)': `<rootDir>../microcosm/${MICROCOSM_DIR}$1`
  }
}
