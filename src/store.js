/**
 * Store
 * This is the base class with which all stores draw their common
 * behavior. It can also be extended.
 */

const EMPTY = {}

export default class Store {

  /**
   * Setup runs right after a store is added to a Microcosm, but before
   * it rebases state to include the store's `getInitialState` value. This
   * is useful for one-time setup instructions
   */
  setup() {
    // NOOP
  }

  /**
   * A default register function that just returns an empty object. This helps
   * keep other code from branching.
   */
  register() {
    // NOOP
    return EMPTY
  }

  /**
   * Given a next and previous state, should the value be committed
   * to the next revision?
   *
   * @param {any} next - the next state
   * @param {any} last - the last state
   *
   * @return {boolean} Should the state update?
   */
  shouldCommit(next, last) {
    return true
  }

  /**
  * This is the actual operation used to write state to a Microcosm.
  * Normally this isn't overridden, but it is useful for writing custom
  * store behavior.
  *
  * @param {object} state - The current application state
  * @param {string} key - the key path to assign
  * @param {any} value - The value to assign to a key
  * @return {object} newState - The next state for the Microcosm instance
  */
  set(last, next) {
    return next
  }

  /**
   * A middleware method for determining what exactly is assigned to
   * repo.state. This gives libraries such as ImmutableJS a chance to serialize
   * into a primitive JavaScript form before being publically exposed.
   *
   * @param {any} next - The next state for the store
   */
  commit(next) {
    return next
  }

}
