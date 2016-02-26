/**
 * History Plugin
 * Stores transaction history as a tree.
 */

import Tree      from '../Tree'
import lifecycle from '../lifecycle'

const History = {

  register(app, { maxHistory=-Infinity }) {
    this.cache = {}
    this.maxHistory = maxHistory

    app.history = new Tree()
  },

  shouldHistoryKeep() {
    return this.maxHistory > 0 && this.app.history.size() <= this.maxHistory
  },

  clean(transaction) {
    if (transaction.complete && this.shouldHistoryKeep() === false) {
      this.cache = this.fold(this.cache, transaction)
      return true
    }

    return false
  },

  fold(state, { active, type, payload }) {
    return active ? this.app.dispatch(state, type, payload) : state
  },

  /**
   * Rolls state forward, cleaning up any erroneous or completed actions.
   */
  [lifecycle.willUpdate](app) {
    return app.history.prune(this.clean, this)
                      .reduce(this.fold, this.cache, this)
  },

  [lifecycle.willOpenTransaction](app, transaction) {
    app.history.append(transaction)
  }

}

export default History
