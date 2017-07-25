/**
 * @fileoverview Keeps track of prior action states according to an
 * action's id
 * @flow
 */

import type Action from './action'

class Archive {
  pool: { [key: string]: Object }

  constructor() {
    this.pool = {}
  }

  /**
   * Create an initial snapshot for an action by setting it to that of its
   * parent.
   */
  create(action: Action) {
    this.set(action, this.get(action.parent))
  }

  /**
   * Access a prior snapshot for a given action
   */
  get(action: ?Action, fallback: ?Object): Object {
    console.assert(action, 'Unable to get %s action', action)

    if (action && this.has(action)) {
      return this.pool[action.id]
    }

    return fallback == null ? {} : fallback
  }

  /**
   * Does a snapshot exist for an action?
   */
  has(action: Action): boolean {
    return typeof this.pool[action.id] !== 'undefined'
  }

  /**
   * Assign a new snapshot for an action
   */
  set(action: Action, snapshot: Object) {
    this.pool[action.id] = snapshot
  }

  /**
   * Remove a snapshot for an action.
   */
  remove(action: Action) {
    console.assert(action, 'Unable to remove %s action.', action)

    delete this.pool[action.id]
  }
}

export default Archive
