'use strict'

import babel from 'rollup-plugin-babel'
import strip from 'rollup-plugin-strip'
import uglify from 'rollup-plugin-uglify'
import nodeResolve from 'rollup-plugin-node-resolve'
import path from 'path'

const config = {
  format: 'cjs',
  exports: 'named',
  external: ['react', 'form-serialize', path.resolve('src/microcosm.js')],
  plugins: [
    nodeResolve(),
    babel({
      plugins: ['external-helpers']
    })
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
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    })
  )
}

export default config
