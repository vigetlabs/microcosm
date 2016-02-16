/**
 * History Plugin
 * Stores transaction history as a tree.
 */

import Tree      from '../Tree'
import dispatch  from '../dispatch'
import lifecycle from '../lifecycle'

const History = {

  register(app, { maxHistory=-Infinity }) {
    this.cache = {}
    this.maxHistory = maxHistory

    app.history = new Tree()

    app.push(lifecycle.willStart)
  },

  shouldHistoryKeep(transaction) {
    return this.maxHistory > 0 && this.app.history.size() <= this.maxHistory
  },

  clean(transaction) {
    if (transaction.complete && this.shouldHistoryKeep(transaction) == false) {
      this.cache = dispatch(this.app.stores, this.cache, transaction)
      return true
    }

    return false
  },

  /**
   * Rolls state forward, cleaning up any erroneous or completed actions.
   */
  [lifecycle.willUpdate](app, state) {
    let reducer = dispatch.bind(null, app.stores)

    return app.history.prune(this.clean, this)
                      .reduce(reducer, this.cache)
  },

  [lifecycle.willOpenTransaction](app, transaction) {
    app.history.append(transaction)
  }

}

export default History
