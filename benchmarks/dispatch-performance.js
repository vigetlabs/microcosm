var Microcosm = require('../dist/src/Microcosm')
var Transaction = require('../dist/src/Transaction')
var SIZE = 10000

process.stdout.write('\Dispatching ' + SIZE + ' actions')

var app = new Microcosm()

var action = function test () {}
action.toString = function () { return 'test' }

app.shouldTransactionMerge = function () {
  return false
}

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

app.addStore('one',   Store)
app.addStore('two',   Store)
app.addStore('three', Store)
app.addStore('four',  Store)
app.addStore('five',  Store)

for (var i = 0; i < SIZE; i++) {
  app.history.append(Transaction(action, true, true))
}

// Warm up first.
// This gives V8 time to analyze the types for the code.
// Otherwise confusing "insufficient type data" deoptimizations
// are thrown.
for (var q = 0; q < 10; q++) {
  app.push(action, true)
}

console.time('')
app.push(action, true)
console.timeEnd('')
