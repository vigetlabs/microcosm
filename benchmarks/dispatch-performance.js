var Microcosm = require('../dist/src/Microcosm')
var Transaction = require('../dist/src/Transaction')
var SIZE = 10000

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


// "Warm up" dispatch
for (var j = 0; j < 1000; j++) {
  app.rollforward()
}

for (var i = 0; i < SIZE; i++) {
  app.history.append(Transaction(action, true, true))
}

var label = 'Dispatched ' + SIZE + ' actions:'
console.time(label)
app.push(action, true)
console.timeEnd(label)
