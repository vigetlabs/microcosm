let Diode  = require('diode')
let signal = require('./signal')

function Transaction(action, params) {
  Diode(this)

  this.action = action
  this.params = params
  this.timestamp = Date.now()
}

Transaction.prototype = {

  constructor: Transaction,

  active : false,
  body   : null,
  done   : false,
  error  : null,

  run() {
    return signal(this.action, this.params, this.resolve, this.reject, this)
  },

  resolve(body, done) {
    this.active = true
    this.body   = body
    this.done   = this.done || done

    this.publish()
  },

  reject(error) {
    this.active = false
    this.error  = error || new Error("Transaction failed")
    this.done   = true

    this.publish()
  }

}

module.exports = Transaction
