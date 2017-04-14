'use strict'

import babel from 'rollup-plugin-babel'
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
    'ric',
    path.resolve('src/microcosm.js')
  ],
  plugins: [
    babel(),
    nodeResolve()
  ]
}

if (process.env.STRICT !== 'true') {
  config.plugins.push(
    strip({
      debugger: true,
      functions: ['console.*'],
      sourceMap: true
    })
  )
}

if (process.env.MINIFY) {
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
