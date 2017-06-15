/**
 * @fileoverview Keeps track of prior action states according to an
 * action's id
 * @flow
 */

import type Action from './action'

type Payload = { [string]: * }

class Archive {
  pool: { [string]: Payload }

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
  create(action: Action): void {
    this.set(action, this.get(action.parent))
  }

  /**
   * Access a prior snapshot for a given action
   * @param {Action} action Action for requested snapshot
   */
  get(action: Action, fallback: ?Payload): Payload {
    console.assert(action, 'Unable to get ' + action + ' action')

    if (this.has(action)) {
      return this.pool[action.id]
    }

    return fallback == null ? {} : fallback
  }

  /**
   * Does a snapshot exist for an action?
   */
  has(action:Action):boolean {
    return typeof this.pool[action.id] !== 'undefined'
  }

  /**
   * Assign a new snapshot for an action
   * @param {Action} action Action for requested snapshot
   * @param {Object} snapshot
   */
  set(action: Action, snapshot: Payload) {
    this.pool[action.id] = snapshot
  }

  /**
   * Remove a snapshot for an action.
   * @param {Action} action Action to eliminate snapshot for
   */
  remove(action: Action): void {
    console.assert(action, 'Unable to remove ' + action + ' action.')

    delete this.pool[action.id]
  }
}

export default Archive
