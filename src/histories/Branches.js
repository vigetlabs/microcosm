/**
 * Branches History
 * Stores transaction history as a tree.
 */

import Tree from '../Tree'

let Branches = function (options={}) {
  this.base = {}
  this.tree = new Tree()
  this.maxHistory = options.maxHistory || -Infinity
}

Branches.prototype = {

  shouldHistoryKeep(transaction) {
    return this.size() <= this.maxHistory
  },

  clean(send, transaction) {
    if (transaction.complete && !this.shouldHistoryKeep(transaction)) {
      this.base = send(this.base, transaction)
      return true
    }

    return false
  },

  rollforward(send) {
    this.tree.prune(transaction => this.clean(send, transaction))

    return this.tree.branch().reduce(send, this.base)
  },

  transactionDidOpen(transaction) {
    this.tree.append(transaction)
  },

  transactionDidUpdate(transaction, payload) {
    transaction.active  = true
    transaction.payload = payload
  },

  transactionDidFail(transaction, error) {
    transaction.active = false
    transaction.error  = error
  },

  transactionDidComplete(transaction) {
    transaction.complete = true
  },

  root() {
    return this.tree.root()
  },

  size() {
    return this.tree.size()
  }

}

module.exports = Branches
