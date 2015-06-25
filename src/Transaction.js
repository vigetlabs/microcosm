let Diode  = require('diode')
let signal = require('./signal')

const INACTIVE = 'INACTIVE'
const PARTIAL  = 'PARTIAL'
const ABORTED  = 'ABORTED'
const COMPLETE = 'COMPLETE'

function Transaction(action, params) {
  Diode(this)

  this.action = action
  this.params = params

  this.body   = null
  this.error  = null
  this.state  = INACTIVE
}

Transaction.prototype = {

  constructor: Transaction,

  run() {
    return signal(this.action, this.params, this.resolve, this.reject, this)
  },

  resolve(body, done) {
    this.body = body

    this.state = this.isFinished() || done ? COMPLETE : PARTIAL

    this.publish()
  },

  reject(error) {
    this.error = error
    this.state = ABORTED

    this.publish()
  },

  is(state) {
    return this.state === state
  },

  isInactive() {
    return this.is(INACTIVE) || this.is(ABORTED)
  },

  isValid() {
    return this.is(ABORTED) === false
  },

  isFinished() {
    return this.is(COMPLETE)
  }

}

module.exports = Transaction
