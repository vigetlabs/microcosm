/**
 * Fork Performance Benchmark
 * Measures the cost of forking a repo. This is a good indicator of
 * start up time for complicated trees.
 */

'use strict'

const { Microcosm } = require('../build')

const SIZES = [10, 100, 1000]

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

var results = SIZES.map(function(SIZE) {
  var repo = new Microcosm()

  repo.addDomain('one', Domain)

  var then = process.hrtime()
  for (var i = 0; i < SIZE; i++) {
    var fork = repo.fork()
    fork.addDomain('two', Domain)
  }

  var setup = process.hrtime(then)[1] / 1000000

  then = process.hrtime()
  repo.push(action, 1)
  var firstPush = process.hrtime(then)[1] / 1000000

  then = process.hrtime()
  repo.push(action, 1)
  var secondPush = process.hrtime(then)[1] / 1000000

  return {
    Count: SIZE.toLocaleString(),
    Setup: setup.toLocaleString() + 'ms',
    'First Push': firstPush.toLocaleString() + 'ms',
    'Second Push': secondPush.toLocaleString() + 'ms'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
