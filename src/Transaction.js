/**
 * Transaction
 * An account of what has happened.
 */

let dispatch = require('./dispatch')

function Transaction (type, payload) {
  if (this instanceof Transaction === false) {
    return new Transaction(type, payload)
  }

  this.active   = !!payload
  this.children = []
  this.payload  = payload
  this.type     = `${ type }`
}

Transaction.prototype = {
  active   : false,
  payload  : null,
  complete : false,

  update(error, payload, complete) {
    this.active   = !error
    this.error    = error
    this.payload  = payload
    this.complete = complete
  },

  flatten(stores, state) {
    let child = this.next()
    let next  = this.dispatch(stores, state)

    return child ? child.flatten(stores, next) : next
  },

  dispatch(stores, state) {
    return this.active ? dispatch(stores, state, this) : state
  },

  now() {
    let next = this.next()
    return next ? next.now() : this
  },

  add(child) {
    this.children.unshift(child)
  },

  append(child) {
    this.now().add(child)
  },

  next() {
    return this.children[0]
  }

}

module.exports = Transaction
