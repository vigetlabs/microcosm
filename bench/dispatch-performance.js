/**
 * Dispatch Performance Benchmark
 * The goal of this script is to evaluate if our goal of 10,000
 * uniquely folded actions can be done in under 16ms.
 *
 * This test does not account for hardware diversity. It is a simple
 * gut check of "are we fast yet?"
 */

'use strict'

const { Action, History, Microcosm } = require('../build/microcosm')
const time = require('microtime')

const SIZES   = [ 1000, 10000, 50000, 100000, 200000 ]

console.log('\nConducting dispatch benchmark...\n')

const action = n => n

const Domain = {
  getInitialState: () => 0,
  register() {
    return {
      [action]: (n) => n + 1
    }
  }
}

var results = SIZES.map(function (SIZE) {
  /**
   * Force garbage collection. This is exposed by invoking
   * node with --expose-gc. This allows us to record heap usage
   * before and after the test to check for memory leakage
   */
  global.gc()

  var repo = new Microcosm({ maxHistory: Infinity })

  /**
   * Add the domain at multiple keys. This is a better simulation of actual
   * applications. Otherwise, efficiencies are obtained enumerating over
   * very few keys. This is never the case in real-world applications.
   */
  repo.addDomain('one',   Domain)
  repo.addDomain('two',   Domain)
  repo.addDomain('three', Domain)
  repo.addDomain('four',  Domain)
  repo.addDomain('five',  Domain)

  var cost = 0
  var min = Infinity
  var max = -Infinity

  for (var q = 0; q < SIZE; q++) {
    var then = time.now()
    repo.push(action)
    var pass = (time.now() - then) / 1000

    min = Math.min(min, pass)
    max = Math.max(max, pass)
    cost += pass
  }

  return {
    'Actions' : SIZE.toLocaleString(),
    'Slowest' : max.toLocaleString() + 'ms',
    'Fastest' : min.toLocaleString() + 'ms',
    'Average' : (cost / SIZE).toLocaleString() + 'ms',
    'Total'   : cost.toLocaleString() + 'ms'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')
console.table(results)
