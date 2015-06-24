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
    let body = this.action.apply(this, this.params)

    return signal(this.resolve.bind(this), this.reject.bind(this), body)
  },

  resolve(body, done) {
    this.body  = body

    this.state = this.isFinished() || done ? COMPLETE : PARTIAL

    this.publish()
  },

  reject(error) {
    this.error = error
    this.state = ABORTED

    this.publish()
  },

  isInactive() {
    return this.state === INACTIVE
  },

  isValid() {
    return this.state !== ABORTED
  },

  isFinished() {
    return this.state === COMPLETE
  }

}

module.exports = Transaction
