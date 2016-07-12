import Emitter   from './emitter'
import States    from './action/states'
import coroutine from './action/coroutine'
import tag       from './action/tag'

/**
 * Actions represent the progress of resolving an action creator
 * "behavior". For most purposes, they should never be created on
 * their own. Use `push()` within a Microcosm instance so that it
 * can be tracked within its internal state.
 *
 * @example
 * // First define a behavior
 * const getPlanets = () => ajax('/planets.json')
 *
 * // Then use it to create an action
 * const action = new Action(getPlanets)
 *
 * // Finally, execute it. Use the action to track the resolution
 * // of the behavior
 * action.execute().onDone(function () {
 *   // The behavior is now complete. Do stuff
 * })
 *
 * @extends {Emitter}
 * @param {Function} behavior - how the action should resolve.
 * @public
 */
export default class Action extends Emitter {

  constructor(behavior) {
    super()

    if (typeof behavior !== 'function') {
      throw new TypeError('Action was created with an invalid type of ' +
                          (typeof behavior) +
                          '. Actions must be functions.')
    }

    /**
     * A function defining how an action is resolved; usally passed in
     * from Microcosm.prototype.push.
     * @type {function}
     */
    this.behavior = Action.tag(behavior)

    /**
     * Updated as an action resolves according to its behavior.
     * @type {Any}
     */
    this.payload = null

    /**
     * @private
     * @type {number}
     */
    this.depth = 0

    /**
     * @private
     * @type {Action}
     */
    this.parent = null

    /**
     * @private
     * @type {Action}
     */
    this.sibling = null

    /**
     * @private
     * @type {State}
     */
    this.state = States.unset
  }

  /**
   * Check the state of the action to determine what `type` should be
   * dispatched to stores for processing (via register()).
   *
   * @return {String|Null} The action type to dspatch.
   * @private
   */
  get type () {
    if (this.is(States.disabled))  return null
    if (this.is(States.cancelled)) return this.behavior.cancelled
    if (this.is(States.failed))    return this.behavior.failed
    if (this.is(States.done))      return this.behavior.done
    if (this.is(States.loading))   return this.behavior.loading
    if (this.is(States.open))      return this.behavior.open

    return null
  }

  /**
   * Get all child actions, those dispatched after this one within
   * history. This is used by the Microcosm debugger to visualize
   * action history as a DAG.
   *
   * @return {Array} children list of actions
   * @private
   */
  get children () {
    let start = this.next
    let nodes = []

    while (start) {
      nodes.push(start)
      start = start.sibling
    }

    return nodes
  }

  /**
   * Given a string or State constant, determine if the `state` bitmask for
   * the action includes the provided type.
   *
   * @example
   *    action.is('done')
   *    action.is(State.DONE | State.CANCELLED)
   *
   * @param {String|Number} type - Either a string key or numeric type
   * @return {Boolean} does the action match the given types?
   * @private
   */
  is (type) {
    if (typeof type === 'string') {
      type = States[type]
    }

    return (this.state & type) === type
  }

  /**
   * Evaluate the action by invoking the action's behavior with
   * provided parameters. Then pass that value into the `coroutine`
   * function, which will update the state of the action as it
   * processes.
   *
   * @return {Action} self
   * @private
   */
  execute(/** params **/) {
    coroutine(this, this.behavior.apply(this, arguments))

    return this
  }

  /**
   * If defined, sets the payload for the action and triggers a
   * "change" event.
   * @private
   */
  set(payload) {
    if (payload != undefined) {
      this.payload = payload
    }

    this._emit('change', this.payload)
  }

  /**
   * Set the action state to "open", then set a payload if
   * provided. Triggers the "open" event.
   * @public
   */
  open(payload) {
    this.state = States.open
    this.set(payload)
    this._emit('open', this.payload)
  }

  /**
   * Set the action state to "loading", then set a payload if
   * provided. Triggers the "update" event.
   * @public
   */
  send(payload) {
    this.state = States.loading
    this.set(payload)
    this._emit('update', payload)
  }

  /**
   * Set the action state to "failed" and marks the action for clean
   * up, then set a payload if provided. Triggers the "error" event.
   * @public
   */
  reject(payload) {
    this.state = States.failed | States.disposable
    this.set(payload)
    this._emit('error', payload)
  }

  /**
   * Set the action state to "done" and marks the action for clean
   * up, then set a payload if provided. Triggers the "done" event.
   * @public
   */
  close(payload) {
    this.state = States.done | States.disposable
    this.set(payload)
    this._emit('done', this.payload)
  }

  /**
   * Set the action state to "cancelled" and marks the action for clean
   * up, then set a payload if provided. Triggers the "cancel" event.
   * @public
   */
  cancel() {
    this.state = States.cancelled | States.disposable
    this._emit('change')
    this._emit('cancel', this.payload)
  }

  /**
   * Toggles the disabled state, where the action will not
   * dispatch. This is useful in the Microcosm debugger to quickly
   * enable/disable actions. Triggers the "change" event.
   * @private
   */
  toggle() {
    this.state ^= States.disabled
    this._emit('change')
  }

  /**
   * Listen to failure. If the action has already failed, it will
   * execute the provided callback, otherwise it will wait and trigger
   * upon the "error" event.
   *
   * @param {Function} callback
   * @param {any} scope
   * @return {Action} self
   * @public
   */
  onError(callback, scope) {
    if (this.is(States.failed)) {
      callback(this.payload, scope)
    } else {
      this.once('error', callback.bind(scope))
    }

    return this
  }

  /**
   * Listen to progress. Wait and trigger a provided callback on the "update" event.
   *
   * @param {Function} callback
   * @param {any} scope
   * @return {Action} self
   * @public
   */
  onUpdate(callback, scope) {
    this.on('update', callback.bind(scope))

    return this
  }

  /**
   * Listen for completion. If the action has already completed, it will
   * execute the provided callback, otherwise it will wait and trigger
   * upon the "done" event.
   *
   * @param {Function} callback
   * @param {any} scope
   * @return {Action} self
   * @public
   */
  onDone(callback, scope) {
    if (this.is(States.done)) {
      callback(this.payload, scope)
    } else {
      this.once('done', callback.bind(scope))
    }

    return this
  }

  /**
   * Uniquely tag a function. This is used to identify actions when referenced
   * inside of Store `register` functions.
   *
   * @param {Function} fn The target function to add action identifiers to.
   * @param {String} [name] An override to use instead of `fn.name`.
   * @return {Function} The tagged function (same as `fn`).
   * @public
   */
  static tag (fn, name) {
    return tag(fn, name)
  }
}
