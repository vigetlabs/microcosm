let Diode  = require('diode')
let signal = require('./signal')
let noop   = a => a

function Transaction(action, params, callback=noop) {
  Diode(this)

  this.action = action

  // Ensure an array
  this.params = [].concat(params)

  this.timestamp = Date.now()
  this.callback = callback
}

Transaction.prototype = {

  constructor: Transaction,

  active : false,
  body   : null,
  done   : false,
  error  : null,

  finish(error, body) {
    // This is a neat trick to get around the promise try/catch
    // https://github.com/then/promise/blob/master/src/done.js
    setTimeout(this.callback.bind(this, error, body), 0)
  },

  isComplete() {
    return this.error || this.done
  },

  run() {
    return signal(this.action, this.params, (error, body, pending) => {
      this.active = true
      this.body   = body
      this.done   = this.done || !pending
      this.error  = error

      this.publish()

      if (this.isComplete()) {
        this.finish(error, body)
      }
    })
  }

}

module.exports = Transaction
