/**
 * Push Performance Benchmark
 * Measures the performance of pushing a single action.
 */

'use strict'

const { Microcosm } = require('../build')

const SIZES = [1000, 10000, 50000, 100000]

console.log('\nConducting push benchmark...\n')

var results = SIZES.map(function(SIZE) {
  var repo = new Microcosm()

  var action = function test() {}
  action.toString = function() {
    return 'test'
  }

  var Domain = {
    getInitialState: () => 0,
    register() {
      return {
        test: n => n + 1
      }
    }
  }

  /**
   * Add the domain at multiple keys. This is a better simulation of actual
   * applications. Otherwise, efficiencies are obtained enumerating over
   * very few keys. This is never the case in real-world applications.
   */
  repo.addDomain('one', Domain)
  repo.addDomain('two', Domain)
  repo.addDomain('three', Domain)
  repo.addDomain('four', Domain)
  repo.addDomain('five', Domain)

  var then = process.hrtime()

  /**
   * Append a given number of actions into history. We use this method
   * instead of `::push()` for benchmark setup performance. At the time of writing,
   * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
   * This adds up to a very slow boot time!
   */
  var startMemory = process.memoryUsage().heapUsed
  for (var i = 0; i < SIZE; i++) {
    repo.push(action)
  }
  var endMemory = process.memoryUsage().heapUsed

  var total = process.hrtime(then)[1] / 1000000
  var average = total / SIZE

  return {
    Volume: SIZE.toLocaleString(),
    Total: total.toLocaleString() + 'ms',
    Average: average.toLocaleString() + 'ms',
    'Memory Usage': ((endMemory - startMemory) / 1000000).toFixed(2) + 'mbs'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
