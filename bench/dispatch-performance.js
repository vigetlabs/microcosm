/**
 * Dispatch Performance Benchmark
 * The goal of this script is to evaluate if our goal of 10,000
 * uniquely folded actions can be done in under 16ms.
 *
 * This test does not account for hardware diversity. It is a simple
 * gut check of "are we fast yet?"
 */

import History   from '../src/history'
import Microcosm from '../src/microcosm'
import time      from 'microtime'

const SIZES   = [ 1000, 10000, 50000, 100000, 200000 ]
const SAMPLES = 5

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

  /**
   * Step 1. Build a history tree before making a Microcosm,
   * this lets us isolate history building so we can specifically
   * profile the dispatch process
   */
  var history = new History({ limit: Infinity })

  for (var i = 0; i < SIZE; i++) {
    history.append(action).resolve(true)
  }

  var repo = new Microcosm({ history })

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

  /**
   * Warm up `::push()`
   * This gives V8 time to analyze the types for the code.
   * Otherwise confusing "insufficient type data" deoptimizations
   * are thrown.
   */

  var average = 0
  for (var q = 0; q < SAMPLES; q++) {
    var then = time.now()
    repo.rollforward()
    average += (time.now() - then) / 1000
  }

  average /= SAMPLES

  return {
    'Actions'      : SIZE.toLocaleString(),
    'Rollforward'  : average.toLocaleString() + 'ms'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')
console.table(results)
