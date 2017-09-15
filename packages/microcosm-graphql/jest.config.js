const MICROCOSM_DIR = process.env.BUNDLED ? 'build/min' : 'src'

module.exports = {
  watchPathIgnorePatterns: ['example'],
  modulePathIgnorePatterns: ['build', 'example'],
  coveragePathIgnorePatterns: ['build', 'examples', 'test'],
  moduleNameMapper: {
    '.*?microcosm(/.+|$)': `<rootDir>../microcosm/${MICROCOSM_DIR}$1`
  }
}
