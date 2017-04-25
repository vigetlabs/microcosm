/**
 * @fileoverview Keeps track of prior action states according to an
 * action's id
 */

class Archive {
  /**
   * @property {Object} pool An object mapping of action ids to snapshots
   */
  constructor() {
    this.pool = {}
  }

  /**
   * Create an initial snapshot for an action by setting it to that of its
   * parent.
   * @param {Action} action Action to create an initial snapshot for
   */
  create(action) {
    this.set(action, this.get(action.parent))
  }

  /**
   * Access a prior snapshot for a given action
   * @param {Action} action Action for requested snapshot
   */
  get(action, fallback) {
    console.assert(action, 'Unable to get ' + action + ' action')

    let value = this.pool[action.id]

    return value === undefined ? fallback : value
  }

  /**
   * Assign a new snapshot for an action
   * @param {Action} action Action for requested snapshot
   * @param {Object} snapshot
   */
  set(action, snapshot) {
    this.pool[action.id] = snapshot
  }

  /**
   * Remove a snapshot for an action.
   * @param {Action} action Action to eliminate snapshot for
   */
  remove(action) {
    console.assert(action, 'Unable to remove ' + action + ' action.')

    delete this.pool[action.id]
  }
}

export default Archive
