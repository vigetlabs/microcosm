/*
 * @fileoverview All Microcosms have a history. This history keeps
 * track of outstanding actions, working with a Microcosm to determine
 * the next application state as actions move through different
 * states.
 * @flow
 */

import Action from './action'
import Emitter from './emitter'
import defaultUpdateStrategy from './default-update-strategy'
import { merge } from './utils'
import { START } from './lifecycle'
import { type Updater } from './default-update-strategy'
import { iteratorTag } from './symbols'

type HistoryOptions = {
  maxHistory?: number,
  batch?: boolean,
  updater?: (options: Object) => Updater
}

export const HISTORY_DEFAULTS = {
  batch: false,
  maxHistory: 1,
  updater: defaultUpdateStrategy
}

class History extends Emitter {
  size: number
  limit: number
  updater: (options: Object) => Updater
  releasing: boolean
  release: () => void
  head: Action
  root: Action
  batch: boolean

  constructor(config: HistoryOptions) {
    super()

    let options = merge(HISTORY_DEFAULTS, config)

    this.size = 0
    this.setLimit(options.maxHistory)
    this.batch = options.batch

    this.updater = options.updater(options)

    // Track whether a release is pending. This prevents .wait() from getting
    // stuck in limbo
    this.releasing = false

    this.release = () => this.closeRelease()

    this.begin()
  }

  /**
   * Set the head of the tree to a target action. This has the effect
   * of controlling time in a Microcosm's history.
   */
  checkout(action: ?Action) {
    let sharedRoot = this.sharedRoot(action)

    this.head = action || this.head

    // Each action has a "next" property that tells the history how to
    //  move forward. Update that path back to the sharedRoot:
    let cursor = this.head
    while (cursor && cursor !== sharedRoot) {
      let parent = cursor.parent

      if (parent) {
        parent.lead(cursor)
      }

      cursor = parent
    }

    this.setSize()

    this.reconcile(sharedRoot)

    return this
  }

  /**
   * Toggle actions in bulk, then reconcile from the first action
   */
  toggle(actions: Action | Action[]) {
    let list = [].concat(actions)

    list.forEach(action => action.toggle(true))

    // determine oldest active action to reconcile on
    let toReconcile
    let toReconcileIndex = Infinity
    let actionCache = this.toArray()
    list.forEach(action => {
      let activeIndex = actionCache.indexOf(action)
      if (activeIndex >= 0 && activeIndex < toReconcileIndex) {
        toReconcileIndex = activeIndex
        toReconcile = action
      }
    })

    if (toReconcile) this.reconcile(toReconcile)
  }

  /**
   * Convert the active branch of history into an array.
   */
  toArray() {
    return this.map(n => n)
  }

  /**
   * Map over the active branch.
   */
  // $FlowFixMe
  [iteratorTag](): Iterator<Action, void> {
    let cursor = this.root

    let iterator = {
      next: () => {
        var next = cursor

        if (next == null) {
          return { done: true }
        }

        cursor = next == this.head ? null : cursor.next

        // Ignore certain lifecycle actions that are only for
        // internal purposes
        if (next && next.command === START) {
          return iterator.next()
        }

        return { value: next, done: false }
      }
    }

    return iterator
  }

  map(fn: (action: Action, index: number) => *, scope?: Object) {
    // $FlowFixMe
    let iterator = this[iteratorTag]()
    let next = iterator.next()
    let items = []

    while (!next.done) {
      items.push(fn.call(scope, next.value, items.length))
      next = iterator.next()
    }

    return items
  }

  /**
   * Return a promise that represents the resolution of all actions in
   * the current branch.
   */
  wait(): Promise<*> {
    let group = new Action('GROUP')

    group.link(this.toArray())

    return group.then(() => {
      if (this.releasing) {
        return new Promise(resolve => {
          this.once('release', resolve)
        })
      }
    })
  }

  /**
   * Chain off of wait(). Provides a promise interface
   */
  then(pass?: Function, fail?: Function): Promise<*> {
    return this.wait().then(pass, fail)
  }

  /**
   * Setup the head and root action for a history. This effectively
   * starts or restarts history.
   */
  begin() {
    this.root = this.head = this.append(START, 'resolve')
  }

  /**
   * Append a new action to the end of history
   */
  append(
    command: string | Command,
    status?: ?Status,
    origin: Microcosm
  ): Action {
    let action = new Action(command, status, origin)

    if (this.head) {
      this.head.lead(action)
    } else {
      this.root = action
    }

    this.head = action
    this.size += 1

    action.on('change', this.reconcile, this)

    if (status && action.command !== START) {
      this.reconcile(action)
    }

    return action
  }

  /**
   * Remove an action from history, connecting adjacent actions
   * together to bridge the gap.
   */
  remove(action: Action) {
    if (action.connected === false) {
      return
    }

    // cache linking references and activeness
    let parent = action.parent
    let next = action.next
    let wasActive = this.isActive(action)

    this.clean(action)

    // if there are no more actions left, we're done
    if (this.size <= 0) {
      this.begin()
      return
    }

    // reset head/root references if necessary
    if (action === this.head && parent) {
      next = this.head = parent
    } else if (action === this.root && next) {
      this.root = next
    }

    // reconcile history if action was in active history branch
    if (next && wasActive && !action.disabled) {
      this.reconcile(next)
    }
  }

  /**
   * The actual clean up operation that purges an action from both
   * history, and removes all snapshots within tracking repos.
   */
  clean(action: Action) {
    this.size -= 1

    this._emit('remove', action, action)

    action.remove()
  }

  /**
   * Re-reconcile the last action. Used by Microcosms to "refresh" their snapshot
   */
  refresh() {
    this.reconcile(this.head)
  }

  /**
   * Starting with a given action, emit events such that repos can
   * dispatch actions to domains in a consistent order to build a new
   * state. This is how Microcosm updates state.
   */
  reconcile(action: Action) {
    console.assert(this.head, 'History should always have a head node')
    console.assert(action, 'History should never reconcile ' + typeof action)

    if (action.command !== START) {
      this._emit('change', action, this.head)
    }

    this.queueRelease()
  }

  /**
   * Batch releases by "queuing" an update. See `closeRelease`.
   */
  queueRelease() {
    if (!this.releasing) {
      this.releasing = true
      this.updater(this.release)
    }
  }

  /**
   * Complete a release by emitting the "release" event. This function
   * is called by the updater for the given history. If batching is
   * enabled, it will be asynchronous.
   */
  closeRelease() {
    console.assert(
      this.releasing,
      'Close release should never be called when not releasing.'
    )

    this.releasing = false

    this._emit('release')

    this.archive()
  }

  /**
   * Instead of holding on to actions forever, Microcosm initiates an
   * archival process at the end of every reconciliation. If the
   * active branch of history is greater than the `limit` property,
   * signal that the action should be removed.
   * @private
   */
  archive() {
    let size = this.size
    let root = this.root

    while (size > this.limit && root.complete) {
      size -= 1

      if (root.next) {
        root = root.next
      }
    }

    if (root.parent) {
      this._emit('remove', root.parent.parent, null)
    }

    if (root !== this.root) {
      this.root = root
      root.prune()
    }

    this.size = size
  }

  /**
   * Update the size of the tree by bubbling up from the head to the
   * root.
   */
  setSize() {
    let action = this.head
    let size = 1

    while (action && action !== this.root) {
      action = action.parent
      size += 1
    }

    this.size = size
  }

  /**
   * Set the limit of the history object.
   */
  setLimit(limit: number) {
    this.limit = Math.max(HISTORY_DEFAULTS.maxHistory, limit)
  }

  /**
   * Determine if provided action is within active history branch
   */
  isActive(action: Action) {
    let cursor = action

    while (cursor) {
      if (cursor === this.head) {
        return true
      }
      cursor = cursor.next
    }

    return false
  }

  /**
   * Starting with the provided action, navigate up the parent chain
   * until you find an action which is active. That action is the shared
   * root between the provided action and the current head.
   */
  sharedRoot(action: ?Action): Action {
    let cursor = action

    while (cursor) {
      if (this.isActive(cursor)) {
        return cursor
      }
      cursor = cursor.parent
    }

    return this.head
  }

  toString() {
    return this.toArray().join(', ')
  }

  /**
   * Serialize history into JSON data
   */
  toJSON() {
    return {
      head: this.head.id,
      root: this.root.id,
      size: this.size,
      tree: this.root
    }
  }
}

export default History
