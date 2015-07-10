let signal  = require('./signal')
let flatten = require('./flatten')

function Transaction(action, params) {
  this.action = action

  // Ensure an array
  this.params = flatten(params)
  this.timestamp = Date.now()
}

Transaction.prototype = {

  constructor: Transaction,

  active : false,
  body   : null,
  done   : false,
  error  : null,

  isComplete() {
    return this.error || this.done
  },

  run(resolve, reject, progress) {
    return signal(this.action, this.params, (error, body, pending) => {
      this.active = true
      this.body   = body
      this.done   = this.done || !pending
      this.error  = error

      if (error) {
        reject(error)
      }

      progress()

      if (this.isComplete()) {
        // This is a neat trick to get around the promise try/catch
        // https://github.com/then/promise/blob/master/src/done.js
        setTimeout(resolve.bind(this, error, body), 0)
      }
    })
  }

}

module.exports = Transaction
