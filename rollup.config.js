'use strict'

import babel from 'rollup-plugin-babel'
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
    babel(),
    nodeResolve()
  ]
}

if (process.env.BABEL_ENV === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        passes: 5
      },
      mangleProperties: {
        regex: /^_/
      },
      mangle: {
        toplevel: true
      }
    })
  )
}

export default config
