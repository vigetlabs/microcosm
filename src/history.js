import Action from './action'
import Emitter from './emitter'
import defaultUpdateStrategy from './default-update-strategy'
import { merge } from './utils'
import { BIRTH, START } from './lifecycle'

const DEFAULTS = {
  maxHistory: 1,
  batch: false,
  updater: defaultUpdateStrategy
}

/**
 * @fileoverview All Microcosms have a history. This history keeps
 * track of outstanding actions, working with a Microcosm to determine
 * the next application state as actions move through different
 * states.
 */
class History extends Emitter {
  constructor(config) {
    super()

    let options = merge(DEFAULTS, config)

    this.size = 0
    this.limit = Math.max(1, options.maxHistory)

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
   * @param {Action} action The new head of the tree
   */
  checkout(action) {
    this.head = action || this.head

    // Each action has a "next" property that tells the history how to
    //  move forward. Update that path:
    this.head.parent.next = this.head

    this.setSize()

    this.reconcile(this.head)

    return this
  }

  /**
   * Toggle actions in bulk, then reconcile from the first action
   * @param {Action[]} - A list of actions to toggle
   */
  toggle(actions) {
    let list = [].concat(actions)

    list.forEach(action => action.toggle('silently'))

    this.reconcile(list[0])
  }

  /**
   * Convert the active branch of history into an array.
   */
  toArray() {
    return this.map(n => n)
  }

  /**
   * Map over the active branch.
   * @param {Function} fn
   * @param {*} scope
   */
  map(fn, scope) {
    let size = this.size
    let items = Array(size)
    let action = this.head

    while (size--) {
      items[size] = fn.call(scope, action)
      action = action.parent
    }

    return items
  }

  /**
   * Return a promise that represents the resolution of all actions in
   * the current branch.
   * @returns {Promise}
   */
  wait() {
    let actions = this.toArray()

    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        let done = actions.every(action => action.complete)
        let errors = actions.filter(action => action.is('reject'))

        if (done) {
          this.off('release', checkStatus)

          if (errors.length) {
            reject(errors[0].payload)
          } else {
            resolve()
          }
        }
      }

      if (this.releasing === false) {
        checkStatus()
      }

      this.on('release', checkStatus)
    })
  }

  /**
   * Chain off of wait(). Provides a promise interface
   * @returns {Promise}
   */
  then(pass, fail) {
    return this.wait().then(pass, fail)
  }

  /**
   * Setup the head and root action for a history. This effectively
   * starts or restarts history.
   */
  begin() {
    this.head = this.root = null
    this.append(START, 'resolve')
  }

  /**
   * Append a new action to the end of history
   * @param {Function|string} command
   * @param {string} [status]
   */
  append(command, status) {
    let action = new Action(command, status)

    if (this.size > 0) {
      this.head.lead(action)
    } else {
      // Always have a parent node, no matter what
      let birth = new Action(BIRTH, 'resolve')
      birth.adopt(action)

      this.root = action
    }

    this.head = action
    this.size += 1

    this._emit('append', action)

    action.on('change', this.reconcile, this)

    return this.head
  }

  /**
   * Remove an action from history, connecting adjacent actions
   * together to bridge the gap.
   * @param {Action} action - Action to remove from history
   */
  remove(action) {
    if (action.isDisconnected()) {
      return
    }

    let next = action.next
    let parent = action.parent

    this.clean(action)

    if (this.size <= 0) {
      this.begin()
      return
    } else if (action === this.head && !next) {
      next = this.head = parent
    } else if (action === this.root) {
      this.root = next
    }

    if (!action.disabled && next) {
      this.reconcile(next)
    }
  }

  /**
   * The actual clean up operation that purges an action from both
   * history, and removes all snapshots within tracking repos.
   * @param {Action} action - Action to clean up
   */
  clean(action) {
    this.size -= 1

    this._emit('remove', action)

    action.remove()
  }

  /**
   * Starting with a given action, emit events such that repos can
   * dispatch actions to domains in a consistent order to build a new
   * state. This is how Microcosm updates state.
   * @param {Action} action
   */
  reconcile(action) {
    console.assert(this.head, 'History should always have a head node')
    console.assert(action, 'History should never reconcile ' + action)

    let focus = action

    while (focus) {
      this._emit('update', focus)

      if (focus === this.head) {
        break
      } else {
        focus = focus.next
      }
    }

    this.archive()

    this._emit('reconcile', action)

    this.queueRelease()
  }

  /**
   * Batch releases by "queuing" an update. See `closeRelease`.
   */
  queueRelease() {
    if (this.releasing === false) {
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
    this.releasing = false
    this._emit('release')
  }

  /**
   * Instead of holding on to actions forever, Microcosm initiates an
   * archival process at the end of every reconciliation. If the
   * active branch of history is greater than the `limit` property,
   * signal that the action should be removed.
   */
  archive() {
    let size = this.size
    let root = this.root

    while (size > this.limit && root.complete) {
      size -= 1
      this._emit('remove', root.parent)
      root = root.next
    }

    root.prune()

    this.root = root
    this.size = size
  }

  /**
   * Update the size of the tree by bubbling up from the head to the
   * root.
   */
  setSize() {
    let action = this.head
    let size = 1

    while (action !== this.root) {
      action = action.parent
      size += 1
    }

    this.size = size
  }
}

export default History
