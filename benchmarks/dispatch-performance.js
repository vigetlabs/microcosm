/**
 * Dispatch Performance Benchmark
 * The goal of this script is to evaluate if our goal of 10,000
 * uniquely folded transactions can be done in under 16ms.
 *
 * This test does not account for hardware diversity. It is a simple
 * gut check of "are we fast yet?"
 */

var Microcosm = require('../dist/src/Microcosm')
var Transaction = require('../dist/src/Transaction')
var time  = require('microtime')
var SIZE = 10000

process.stdout.write('\Dispatching ' + SIZE + ' actions')

var app = new Microcosm()

/**
 * Disable the default merger strategy. This prevents
 * transactions from cleaning up, which will cause more
 * than one complete transaction to merge at a time.
 */
app.shouldHistoryKeep = function () {
  return true
}

var action = function test () {}
action.toString = function () { return 'test' }

var Store = {
  getInitialState: function () {
    return 0
  },
  register: function () {
    return {
      test: function(n) {
        return n + 1
      }
    }
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
 * Append a given number of transactions into history. We use this method
 * instead of `::push()` for benchmark setup performance. At the time of writing,
 * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
 * This adds up to a very slow boot time!
 */
for (var i = 0; i < SIZE; i++) {
  app.history.append(Transaction(action, true, true))
}

/**
 * Warm up `::push()`
 * This gives V8 time to analyze the types for the code.
 * Otherwise confusing "insufficient type data" deoptimizations
 * are thrown.
 */

for (var q = 0; q < 10; q++) {
  app.push(action, true)
}

/**
 * Console.time records the span of time between its invocation and
 * sibling function `console.timeEnd()`
 */
var then = time.now()
app.push(action, true)
console.log(': %s', (time.now() - then) / 1000)
