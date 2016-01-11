/**
 * Branches History
 * Stores transaction history as a tree.
 */

import Tree from '../Tree'

let Branches = function (options={}) {
  this.cache = {}
  this.tree = new Tree()
  this.maxHistory = options.maxHistory || -Infinity
}

Branches.prototype = {

  shouldHistoryKeep(transaction) {
    return this.maxHistory > 0 && this.size() <= this.maxHistory
  },

  clean(send, transaction) {
    if (transaction.complete && this.shouldHistoryKeep(transaction) == false) {
      this.cache = send(this.cache, transaction)
      return true
    }

    return false
  },

  rollforward(send) {
    this.tree.prune(transaction => this.clean(send, transaction))

    return this.tree.branch().reduce(send, this.cache)
  },

  transactionDidOpen(transaction) {
    this.tree.append(transaction)
  },

  transactionDidUpdate(transaction, payload) {
    transaction.active  = true
    transaction.payload = payload
  },

  transactionDidFail(transaction, error) {
    transaction.active  = false
    transaction.error   = true
    transaction.payload = error
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
