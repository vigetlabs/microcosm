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
var time  = require('microtime')
var SIZE = 10000

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
for (var i = 0; i < SIZE; i++) {
  app.history.append(new Transaction(action, true))
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

var then = time.now()
app.push(action, true)
console.log('Dispatched %s actions in %sms\n', SIZE, (time.now() - then) / 1000)
