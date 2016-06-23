/**
 * Dispatch Performance Benchmark
 * The goal of this script is to evaluate if our goal of 10,000
 * uniquely folded actions can be done in under 16ms.
 *
 * This test does not account for hardware diversity. It is a simple
 * gut check of "are we fast yet?"
 */

var Microcosm = require('../dist/microcosm').default
var time      = require('microtime')
var SIZES     = [ 1000, 10000, 50000, 100000, 200000]
var SAMPLES   = 25

console.log('\nConducting dispatch benchmark...\n')

var results = SIZES.map(function (SIZE) {
  /**
   * Force garbage collection. This is exposed by invoking
   * node with --expose-gc. This allows us to record heap usage
   * before and after the test to check for memory leakage
   */
  global.gc()

  var app = new Microcosm({ maxHistory: Infinity })

  var action = function test () {}
  action.toString = function () { return 'test' }

  var Store = function() {
    return {
      getInitialState: () => 0,
      test: (n) => n + 1
    }
  }

  /**
   * Add the store at multiple keys. This is a better simulation of actual
   * applications. Otherwise, efficiencies are obtained enumerating over
   * very few keys. This is never the case in real-world applications.
   */
  app.addStore('one',   Store)
  app.addStore('two',   Store)
  app.addStore('three', Store)
  app.addStore('four',  Store)
  app.addStore('five',  Store)

  /**
   * Append a given number of actions into history. We use this method
   * instead of `::push()` for benchmark setup performance. At the time of writing,
   * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
   * This adds up to a very slow boot time!
   */
  var startMemory = process.memoryUsage().heapUsed
  for (var i = 0; i < SIZE; i++) {
    app.history.append(action).send(true)
  }
  var endMemory = process.memoryUsage().heapUsed

  /**
   * Warm up `::push()`
   * This gives V8 time to analyze the types for the code.
   * Otherwise confusing "insufficient type data" deoptimizations
   * are thrown.
   */

  var average = 0
  for (var q = 0; q < SAMPLES; q++) {
    var then = time.now()
    app.rollforward()
    average += (time.now() - then) / 1000
  }

  average /= SAMPLES

  return {
    'Actions'      : SIZE.toLocaleString(),
    'Rollforward'  : average.toLocaleString() + 'ms',
    'Memory Usage' : ((endMemory - startMemory) / 1000000).toFixed(2) + 'mbs'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')
console.table(results)
