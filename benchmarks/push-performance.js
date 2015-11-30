/**
 * Push Performance Benchmark
 * Measures the performance of pushing a single action.
 */

var Microcosm   = require('../dist/Microcosm')
var Transaction = require('../dist/Transaction')
var time        = require('microtime')
var SIZE        = 10000

var app = new Microcosm()

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

var then = time.now()

/**
 * Append a given number of transactions into history. We use this method
 * instead of `::push()` for benchmark setup performance. At the time of writing,
 * `push` takes anywhere from 0.5ms to 15ms depending on the sample range.
 * This adds up to a very slow boot time!
 */

for (var i = 0; i < SIZE; i++) {
  app.push(action)
}

var total   = (time.now() - then) / 1000
var average = total / SIZE

console.log('Pushed %s actions in %sms (average of %sms)\n', SIZE, total, average)
