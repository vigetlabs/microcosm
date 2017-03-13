/**
 * Keep track of prior action states according to an action's id
 * @constructor
 * @property {Object} pool An object mapping of action ids to snapshots
 */
export default function Archive () {
  this.pool = {}
}

Archive.prototype = {
  /**
   * Access a prior snapshot for a given action
   * @param {string} key Identifier for snapshot
   */
  get (key, fallback) {
    return this.has(key) ? this.pool[key] : null
  },

  /**
   * Determine if an archive has a snapshot for an action
   * @param {string} key Identifier for snapshot
   * @return {boolean}
   */
  has (key) {
    return this.pool.hasOwnProperty(key)
  },

  /**
   * Assign a new snapshot for an action
   * @param {string} key Identifier for snapshot
   * @param {Object} snapshot
   */
  set (key, snapshot) {
    this.pool[key] = snapshot
  },

  /**
   * Remove a snapshot for an action.
   * @param {string} key Identifier for snapshot
   */
  remove (key) {
    delete this.pool[key]
  }
}
