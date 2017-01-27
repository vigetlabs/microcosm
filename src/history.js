import Action from './action'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 * @constructor
 * @param {number|null} limit - Depth of history before compression
 */
export default function History (limit=0) {
  this.repos = []
  this.limit = limit
}

History.prototype = {
  root  : null,
  focus : null,
  head  : null,
  size  : 0,
  limit : 0,

  /**
   * Start tracking a repo
   * @param {Microcosm} repo
   */
  addRepo (repo) {
    this.repos.push(repo)
  },

  /**
   * Stop tracking a repo
   * @param {Microcosm} repo
   */
  removeRepo (repo) {
    this.repos = this.repos.filter(r => r != repo)
  },

  /**
   * Run a method on every repo, if it implements it.
   * @param {string} method
   * @param {any} payload
   */
  invoke (method, payload) {
    let repos = this.repos

    for (var i = 0, len = repos.length; i < len; i++) {
      repos[i][method](payload)
    }
  },

  /**
   * Adjust the focus point to target a different node. This has the effect of
   * creating undo/redo. This should not be called outside of Microcosm!
   * Instead, use `Microcosm.prototype.checkout`.
   * @param {Action} action
   */
  checkout (action) {
    this.head = action

    if (!action) {
      this.root = this.head = null
    } else if (action.parent) {
      action.parent.next = action
    }

    this.adjustSize()
    this.invalidate()

    return this
  },

  /**
   * Create a new action and append it to the current focus,
   * then adjust the focus to that of the newly created action.
   * @param {Function|String} behavior
   */
  append (behavior) {
    const action = new Action(behavior, this)

    if (this.head) {
      action.parent = this.head

      // To keep track of children, maintain a pointer
      // to the first child ever produced. We might checkout
      // another child later, so we can't use next
      if (this.head.first) {
        this.head.next.sibling = action
      } else {
        this.head.first = action
      }

      this.head.next = action
    } else {
      this.root = action
    }

    this.head = action
    this.size += 1

    return this.head
  },

  /**
  * Handle a change to a node that happened prior to
  * the cache point.
   */
  invalidate () {
    this.focus = null

    this.invoke('unarchive', null)

    this.reconcile()
  },

  /**
   * @param {Action} action
   */
  reconcile (action) {
    // No need to run this function if there are no active repos
    if (this.repos.length <= 0) {
      return false
    }

    this.invoke('rollback', null)

    this.rollforward()

    this.invoke('release', action)
  },

  rollforward () {
    let action = this.focus ? this.focus.next : this.root
    let cacheable = true

    while (action && action.parent !== this.head) {
      if (!action.disabled) {
        this.invoke('reconcile', action)
      }

      // Adjust the focus to the youngest disposable action. No need to
      // rollforward through every single action all the time.
      if (cacheable && action.disposable) {
        this.focus = action
        this.invoke('cache', this.archive())
      } else {
        cacheable = false
      }

      action = action.next
    }
  },

  archive () {
    let shouldArchive = this.size > this.limit

    // Is the cache pointed at the base? If so, that means we need
    // to purge the base.
    if (shouldArchive) {
      this.size -= 1

      if (this.size <= 0) {
        this.root = this.head = this.focus = null
      } else {
        this.root = this.root.next
        this.root.parent = null
      }
    }

    return shouldArchive
  },

  /**
   * Update the current size and active branch path
   */
  adjustSize () {
    let action = this.head
    let size = this.root ? 1 : 0

    while (action && action.parent) {
      let parent = action.parent

      parent.next = action

      action = parent

      size += 1
    }

    this.size = size
  }

}
