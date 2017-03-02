/**
 * Keep track of prior action states according to an action's id
 */

export default function Archive () {
  this.pool = {}
}

Archive.prototype = {
  get (action) {
    return this.pool[action.id]
  },

  has (action) {
    return this.pool.hasOwnProperty(action.id)
  },

  set (action, state) {
    this.pool[action.id] = state
  },

  remove (action) {
    delete this.pool[action.id]
  }
}
