'use strict'

import buble from 'rollup-plugin-buble'
import strip from 'rollup-plugin-strip'
import uglify from 'rollup-plugin-uglify'
import nodeResolve from 'rollup-plugin-node-resolve'
import path from 'path'

const config = {
  format: 'cjs',
  exports: 'named',
  external: [
    'react',
    'form-serialize',
    path.resolve('src/microcosm.js')
  ],
  plugins: [
    buble(),
    nodeResolve(),
    strip()
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        passes: 2,
        drop_console: true
      },
      mangle: {
        toplevel: true,
        regex: /^_/
      }
    })
  )
}

export default config
