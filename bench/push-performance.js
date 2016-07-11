/**
 * Push Performance Benchmark
 * Measures the performance of pushing a single action.
 */

var Microcosm = require('../src/microcosm').default
var time      = require('microtime')
var SIZES     = [ 1000, 10000, 50000, 100000, 200000]

console.log('\nConducting push benchmark...\n')

var results = SIZES.map(function (SIZE) {
  var app = new Microcosm()

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

  var then = time.now()

  /**
   * Append a given number of actions into history. We use this method
   * instead of `::push()` for benchmark setup performance. At the time of writing,
   * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
   * This adds up to a very slow boot time!
   */
  var startMemory = process.memoryUsage().heapUsed
  for (var i = 0; i < SIZE; i++) {
    app.push(action)
  }
  var endMemory = process.memoryUsage().heapUsed

  var total   = (time.now() - then) / 1000
  var average = total / SIZE

  return {
    'Volume' : SIZE.toLocaleString(),
    'Total' : total.toLocaleString() + 'ms',
    'Average' : average.toLocaleString() + 'ms',
    'Memory Usage' : ((endMemory - startMemory) / 1000000).toFixed(2) + 'mbs'
  }
})

/**
 * Finally, report our findings.
 */

require('console.table')

console.table(results)
