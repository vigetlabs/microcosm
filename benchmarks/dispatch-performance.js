/**
 * Dispatch Performance Benchmark
 * The goal of this script is to evaluate if our goal of 10,000
 * uniquely folded transactions can be done in under 16ms.
 *
 * This test does not account for hardware diversity. It is a simple
 * gut check of "are we fast yet?"
 */

var Microcosm   = require('../dist/Microcosm')
var Transaction = require('../dist/Transaction')
var time        = require('microtime')

var SIZE        = 50000
var SAMPLES     = 50

var app = new Microcosm({ maxHistory: Infinity })

var action = function test () {}
action.toString = function () { return 'test' }

var Store = function() {
  return {
    getInitialState: 0,
    test: function(n) { return n + 1}
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

app.start()

/**
 * Append a given number of transactions into history. We use this method
 * instead of `::push()` for benchmark setup performance. At the time of writing,
 * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
 * This adds up to a very slow boot time!
 */
var startMemory = process.memoryUsage().heapUsed
for (var i = 0; i < SIZE; i++) {
  app.history.append(new Transaction(action, true))
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

var duration = (SIZE * (1000 / 60)) / (1000 * 60)

console.log('%sms to dispatch %s actions (%s samples)', average.toFixed(2), SIZE, SAMPLES)
console.log('- %smbs of memory', ((endMemory - startMemory) / 100000).toFixed(2))
console.log("- %s minutes of history", duration.toFixed(2))
console.log("") // New line
