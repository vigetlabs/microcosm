import Action from './action'

/**
 * The central tree data structure that is used to calculate state for
 * a Microcosm. Each node in the tree represents an action. Branches
 * are changes over time.
 *
 * @private
 */
export default class Tree {

  constructor () {
    this.root  = null
    this.focus = null
  }

  /**
   * Adjust the focus point to target a different node. This has the
   * effect of creating undo/redo. This should not be called outside
   * of Microcosm! Instead, use `Microcosm.prototype.checkout`.
   *
   * @api private
   *
   * @param {Action} action - An action to set as the new focus
   * @return {Tree} self
   */
  checkout(action) {
    this.focus = action || this.focus

    return this
  }

  /**
   * Create a new action and append it to the current focus,
   * then adjust the focus to that of the newly created action.
   *
   * @api private
   *
   * @param {Function} behavior - The behavior for the Action
   * @return {Action} The new focus
   */
  append(behavior) {
    const action = new Action(behavior)

    if (this.focus != null) {
      this.connect(action, this.focus)
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
   * @api private
   *
   * @param {Action} child action to append
   * @param {Action} parent action to append to
   *
   * @return {Tree} self
   */
  connect(child, parent) {
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
   * @api private
   *
   * @param {Function} shouldRemove - A predicate for if the action should be removed
   * @param {Function} scope - Scope to invoke `shouldRemove`
   *
   * @return {Tree} self
   */
  prune(shouldRemove, scope) {
    while (this.root && shouldRemove.call(scope, this.root)) {
      this.root = this.root.next
    }

    // If we reach the end (there is no next action), it means
    // we've completely wiped away the tree, so nullify focus
    // to mark a completely empty tree.
    if (!this.root) {
      this.root  = null
      this.focus = null
    }

    return this
  }

  /**
   * Produce an array representation of the current ranch
   *
   * @api public
   *
   * @return {Array} A list where elements are actions in the current branch
   */
  toArray() {
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
   * determine the next application state, so it has been expanded
   * from Array.prototype.reduce into a for loop
   *
   * @api public
   *
   * @param {Function} reducer - The function invoked by each iteration of reduce
   * @param {Any} state - The initial state of the reduction
   * @param {Any} scope - Scope to invoke the reducer with
   *
   * @return {Any} The result of reducing over state
   */
  reduce(reducer, state, scope) {
    const items = this.toArray()

    for (let i = 0, len = items.length; i < len; i++) {
      state = reducer.call(scope, state, items[i], i)
    }

    return state
  }

  /**
   * Get the length of the tree from root to focus.
   *
   * @api public
   * @return {Number} The size of the current branch
   */
  size() {
    return this.root ? 1 + (this.focus.depth - this.root.depth) : 0
  }

}
