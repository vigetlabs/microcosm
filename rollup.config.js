'use strict'

import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
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
    babel()
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        passes: 5
      },
      mangle: { toplevel: true }
    })
  )
}

export default config
