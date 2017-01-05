/**
 * Fork Performance Benchmark
 * Measures the cost of forking a repo. This is a good indicator of
 * start up time for complicated trees.
 */

'use strict'

const { Microcosm } = require('../build/microcosm.min')
const time = require('microtime')

const SIZES = [
  100,
  5000,
  15000,
  30000
]

console.log('\nConducting fork benchmark...\n')

var action = 'test'

var Domain = {
  getInitialState: () => 0,
  register() {
    return {
      [action]: (a, b) => a + b
    }
  }
}

var results = SIZES.map(function (SIZE) {
  var repo = new Microcosm()

  repo.addDomain('one', Domain)

  var then = time.now()
  for (var i = 0; i < SIZE; i++) {
    repo.fork().on('change', () => {})
  }

  var setup = (time.now() - then) / 1000

  then = time.now()
  repo.push(action, 1)
  var push = (time.now() - then) / 1000

  return {
    'Count'  : SIZE.toLocaleString(),
    'Setup'  : setup.toLocaleString() + 'ms',
    'Push'   : push.toLocaleString() + 'ms'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
