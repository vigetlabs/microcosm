import Action from './action'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 */
export default class History {

  constructor () {
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
    const action = new Action(behavior)

    if (this.focus != null) {
      this.connect(this.focus, action)
    }

    this.focus = action

    if (this.root == null) {
      this.root = this.focus
    }

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
    child.depth   = parent.depth + 1

    parent.next   = child

    return this
  }

  /**
   * Walks from the root to the focus until it the given predicate
   * returns false. All actions prior to this point will be forgotten.
   *
   * @private
   * @param {Function} shouldRemove - A predicate for if the action should be removed
   * @param {Function} scope - Scope to invoke `shouldRemove`
   * @return {History} self
   */
  prune (shouldRemove, scope) {
    let root = this.root
    let size = this.size()

    while (size >= 1 && shouldRemove.call(scope, root, size)) {
      root = root.next
      size = size - 1
    }

    // If we reach the end (there is no next action), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (size <= 0) {
      this.root = this.focus = null
    } else {
      this.root = root
    }

    return this
  }

  /**
   * @return {Array} A list representation of the current branch of history
   */
  toArray () {
    let size  = this.size()
    let items = new Array(size)
    let node  = this.focus

    while (--size >= 0) {
      items[size] = node
      node = node.parent
    }

    return items
  }

  /**
   * Reduce over toArray. This function is called by a Microcosm to
   * determine the next repo state, so it has been expanded
   * from Array.prototype.reduce into a for loop
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
   * Get the length of the tree from root to focus.
   * @return {Number} The size of the current branch
   */
  size () {
    return this.root ? 1 + (this.focus.depth - this.root.depth) : 0
  }

}
