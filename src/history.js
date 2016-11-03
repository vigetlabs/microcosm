import Action from './action'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 */
export default class History {

  constructor (limit = 0) {
    this.size = 0
    this.limit = limit

    this.root = null
    this.focus = null
    this.head = null

    this.repos = []
  }

  addRepo(repo) {
    this.repos.push(repo)
  }

  removeRepo(repo) {
    const slot = this.repos.indexOf(repo)

    if (slot >= 0) {
      this.repos.splice(slot, 1)
    }
  }

  invoke(method, payload) {
    /**
     * Important! For each enumerates over items sequentially. A
     * release of a parent Microcosm might cause a fork to tear
     * down. We can not cache the length of the repo list within a
     * for-loop.
     */
    this.repos.forEach(function (repo) {
      if (typeof repo[method] === 'function') {
        repo[method](payload)
      } else {
        console.warn('%s does not implement %s', repo.constructor.name || 'Microcosm', method)
      }
    })
  }

  /**
   * Adjust the focus point to target a different node. This has the
   * effect of creating undo/redo. This should not be called outside
   * of Microcosm! Instead, use `Microcosm.prototype.checkout`.
   */
  checkout (action) {
    this.head = action

    if (!this.head) {
      this.root = null
      this.head = null
    }

    // Clear the focus, we don't know if it was before the action or it
    this.focus = null

    this.setSize()
    this.reconcile()

    return this
  }

  /**
   * Create a new action and append it to the current focus,
   * then adjust the focus to that of the newly created action.
   */
  append (behavior) {
    const action = new Action(behavior, this)

    if (this.head != null) {
      this.connect(this.head, action)
    }

    this.head = action

    if (this.root == null) {
      this.root = this.head
    }

    this.size += 1

    return this.head
  }

  /**
   * Append an action to another, making that action its parent. This
   * produces history.
   */
  connect (parent, child) {
    child.parent  = parent
    child.sibling = parent.next

    parent.next = child

    return this
  }

  isDormant() {
    return this.size <= 0 || this.repos.length <= 0
  }

  reconcile () {
    if (this.isDormant()) {
      return false
    }

    this.invoke('rollback')
    this.rollforward()
    this.archive()
    this.invoke('release')
  }

  rollforward () {
    let actions = this.toArray(this.focus)
    let cacheable = true

    for (var i = 0; i < actions.length; i++) {
      let action = actions[i]

      // Do not reconcile actions that are disabled. They behave
      // as though nothing occured
      if (action.is('disabled') === false) {
        this.invoke('reconcile', action)
      }

      // Adjust the focus to the youngest disposable action. This makes it
      // unncessary to rollforward through every single action all the
      // time.
      if (cacheable && action.is('disposable')) {
        this.focus = action
        this.invoke('cache')
      } else {
        cacheable = false
      }
    }
  }

  archive () {
    // Is the cache pointed at the base? If so, that means we need
    // to purge the base.
    while (this.size > this.limit && this.root && this.root.is('disposable')) {
      let root = this.root

      this.size -= 1

      // Cue up all repos to adjust the archive
      this.invoke('archive', root)

      // Point the base to the next node
      this.root = this.root.next

      root.teardown()
    }

    if (this.size <= 0) {
      this.root = null
      this.head = null
      this.focus = null
    }
  }

  /**
   * Get an array of the active branch
   * @return {Any} The result of reducing over state
   */
  toArray (base) {
    let items = new Array()
    let node  = this.head

    while (node && node !== base) {
      items.push(node)

      if (node === this.root) {
        break;
      }

      node = node.parent
    }

    return items.reverse()
  }

  reduce(fn, initial, scope) {
    let items = this.toArray()

    for (var i = 0; i < items.length; i++) {
      initial = fn.call(scope, initial, items[i], i)
    }

    return initial
  }

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
