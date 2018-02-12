module.exports = {
  globals: {
    Promise: true,
    jest: true,
    expect: true,
    // microcosm-devtools
    chrome: true
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    }
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:flowtype/recommended',
    'plugin:react/recommended'
  ],
  plugins: ['react', 'flowtype', 'flowtype-errors', 'prettier'],
  rules: {
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: true }
    ],
    'sort-vars': 0,
    'no-console': 0,
    'no-unused-vars': [
      2,
      {
        args: 'none',
        varsIgnorePattern: '^_'
      }
    ],
    'prettier/prettier': 'error',
    'react/prop-types': 0
  }
}
