'use strict'

import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import path from 'path'

const config = {
  format    : 'cjs',
  exports   : 'named',
  external  : [
    'react',
    'form-serialize',
    path.resolve('src/microcosm.js')
  ],
  plugins   : [
    buble()
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    uglify({ compress: true, mangle: { toplevel: true } })
  )
}

export default config
