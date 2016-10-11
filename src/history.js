import Action from './action'
import Emitter from './emitter'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 */
export default class History extends Emitter {

  constructor (limit = 0) {
    super()

    this.size  = 0
    this.limit = Math.max(limit, 0)
    this.root  = null
    this.focus = null
  }

  /**
   * Adjust the focus point to target a different node. This has the
   * effect of creating undo/redo. This should not be called outside
   * of Microcosm! Instead, use `Microcosm.prototype.checkout`.
   *
   * @private
   * @param {Action} action - An action to set as the new focus
   * @return {History} self
   */
  checkout (action) {
    this.focus = action

    if (!this.focus) {
      this.focus = null
      this.root  = null
    }

    this.setSize()
    this.reconcile()

    return this
  }

  /**
   * Create a new action and append it to the current focus,
   * then adjust the focus to that of the newly created action.
   *
   * @private
   * @param {Function} behavior - The behavior for the Action
   * @return {Action} The new focus
   */
  append (behavior) {
    const action = new Action(behavior, this)

    if (this.focus != null) {
      this.connect(this.focus, action)
    }

    this.focus = action

    if (this.root == null) {
      this.root = this.focus
    }

    this.size += 1

    return this.focus
  }

  /**
   * Append an action to another, making that action its parent. This
   * produces history.
   *
   * @private
   * @param {Action} parent action to append to
   * @param {Action} child action to append
   * @return {History} self
   */
  connect (parent, child) {
    child.parent  = parent
    child.sibling = parent.next

    parent.next   = child

    return this
  }

  /**
   * Eliminate a node from the tree.
   * @private
   * @param {Action} node - node to disconnect
   * @return {History} self
   */
  disconnect (node) {
    this._emit('archive', node)

    if (node.parent) {
      node.parent.next = null
    }

    node.parent = null
    node.sibling = null
  }

  /**
   * Prune down the tree then emit a change
   */
  reconcile () {
    this.prune()

    this._emit('reconcile')
    this._emit('release')
  }

  /**
   * Prunes the tree. Stops if the curent node is not disposable.
   * @private
   * @return {History} self
   */
  prune () {
    let root = this.root
    let limit = Math.max(0, this.limit)

    while (this.size - limit > 0 && root.is('disposable')) {
      this.disconnect(root)
      this.size -= 1

      root = root.next
    }

    // If we reach the end (there is no next action), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (this.size <= 0) {
      this.root = this.focus = null
    } else {
      this.root = root
    }

    return this
  }

  /**
   * Get an array of the active branch
   *
   * @param {Function} reducer - The function invoked by each iteration of reduce
   * @param {Any} state - The initial state of the reduction
   * @param {Any} scope - Scope of the invoked reducer
   * @return {Any} The result of reducing over state
   */
  toArray () {
    let size  = this.size
    let items = new Array(size)
    let node  = this.focus

    while (--size >= 0) {
      items[size] = node
      node = node.parent
    }

    return items
  }

  /**
   * Reduce over each action.
   *
   * @param {Function} reducer - The function invoked by each iteration of reduce
   * @param {Any} state - The initial state of the reduction
   * @param {Any} scope - Scope of the invoked reducer
   * @return {Any} The result of reducing over state
   */
  reduce (reducer, state, scope) {
    const items = this.toArray()

    for (let i = 0, len = items.length; i < len; i++) {
      state = reducer.call(scope, state, items[i], i, items)
    }

    return state
  }

  /**
   * Update the current size
   */
  setSize () {
    let count = this.root ? 1 : 0
    let node  = this.focus

    while (node !== this.root) {
      count += 1
      node = node.parent
    }

    this.size = count
  }
}
