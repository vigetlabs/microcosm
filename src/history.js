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
  this.size = 0
  this.root = null
  this.focus = null
  this.head = null
}

History.prototype = {

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

    if (!this.head) {
      this.root = this.head = null
    }

    // Clear the focus, we don't know if it was before the action or it
    this.focus = null

    this.setSize()
    this.reconcile(null)

    return this
  },

  /**
   * Create a new action and append it to the current focus,
   * then adjust the focus to that of the newly created action.
   * @param {Function|String} behavior
   */
  append (behavior) {
    const action = new Action(behavior)

    if (this.head != null) {
      this.connect(this.head, action)
    }

    this.head = action

    if (this.root == null) {
      this.root = action
    }

    action.on('change', this.reconcile, this)

    this.size += 1

    return this.head
  },

  /**
   * Append an action to another, making that action its parent. This
   * produces history.
   * @param {Action} parent
   * @param {Action} child
   */
  connect (parent, child) {
    child.parent  = parent
    child.sibling = parent.next

    parent.next = child

    return this
  },

  isDormant () {
    return this.size <= 0 || this.repos.length <= 0
  },

  /**
   * @param {Action} action
   */
  reconcile (action) {
    if (this.isDormant()) {
      return false
    }

    this.invoke('rollback', null)

    this.rollforward()

    this.invoke('release', action)
  },

  rollforward () {
    let actions = this.toArray(this.focus)
    let cacheable = true

    for (var i = 0, len = actions.length; i < len; i++) {
      let action = actions[i]

      // Ignore disabled actions
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
    }
  },

  archive () {
    let shouldArchive = this.size > this.limit

    // Is the cache pointed at the base? If so, that means we need
    // to purge the base.
    if (shouldArchive) {
      this.root.teardown()

      this.root = this.root.next

      this.size -= 1

      if (this.size <= 0) {
        this.root = this.head = this.focus = null
      }
    }

    return shouldArchive
  },

  /**
   * Get an array of the active branch
   * @param {Action|null} base - The starting point for the branch
   * @return {Any} The result of reducing over state
   */
  toArray (base) {
    let items = new Array()
    let node  = this.head

    while (node != null && node !== base) {
      items.push(node)

      if (node === this.root) {
        break;
      }

      node = node.parent
    }

    return items.reverse()
  },

  /**
   * Update the current size
   */
  setSize () {
    let count = this.root ? 1 : 0
    let node  = this.head

    while (node !== this.root) {
      count += 1
      node = node.parent
    }

    this.size = count
  }

}
