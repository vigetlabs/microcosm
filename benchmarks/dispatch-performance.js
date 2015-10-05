var Microcosm = require('../dist/src/Microcosm')
var Transaction = require('../dist/src/Transaction')
var time = require('microtime')
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

for (var i = 0; i < SIZE; i++) {
  app.history.append(Transaction(action, true, true))
}

var then = time.now()
app.push(action, i)
console.log('Dispatched %s actions in %sms', i, (time.now() - then) / 1000)
