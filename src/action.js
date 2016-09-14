import Emitter   from './emitter'
import States    from './action/states'
import coroutine from './action/coroutine'
import tag       from './action/tag'

/**
 * Actions encapsulate the course of resolving an action creator
 * (internally called behaviors). For most purposes, they should never
 * be created on their own. Use `push()` within a Microcosm instance
 * so that it can be tracked within its internal state.
 *
 * @extends {Emitter}
 */
export default class Action extends Emitter {

  /**
   * @param {Function} behavior - how the action should resolve.
   */
  constructor (behavior) {
    super()

    this.depth = 0
    this.behavior = tag(behavior)
    this.payload = null
    this.parent = null
    this.sibling = null
    this.state = States.unset
  }

  /**
   * Check the state of the action to determine what `type` should be
   * dispatched to stores for processing (via register()).
   *
   * @private
   * @return {String|Null} The action type to dspatch.
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
   * @private
   * @return {Array} children list of actions
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
   * @private
   * @param {String|Number} type - Either a string key or numeric type
   * @return {Boolean} does the action match the given types?
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
   * @private
   * @return {Action} self
   */
  execute (/** params **/) {
    coroutine(this, this.behavior.apply(this, arguments))

    return this
  }

  /**
   * If defined, sets the payload for the action and triggers a
   * "change" event.
   *
   * @api private
   * @return {Action} self
   */
  set (payload) {
    if (payload != undefined) {
      this.payload = payload
    }

    this._emit('change', this.payload)

    return this
  }

  /**
   * Set the action state to "open", then set a payload if
   * provided. Triggers the "open" event.
   * @return {Action} self
   */
  open (payload) {
    this.state = States.open
    this.set(payload)
    this._emit('open', this.payload)

    return this
  }

  /**
   * Set the action state to "loading", then set a payload if
   * provided. Triggers the "update" event.
   * @return {Action} self
   */
  send (payload) {
    this.state = States.loading

    this.set(payload)
    this._emit('update', payload)

    return this
  }

  /**
   * Set the action state to "failed" and marks the action for clean
   * up, then set a payload if provided. Triggers the "error" event.
   * @return {Action} self
   */
  reject (payload) {
    this.state = States.failed | States.disposable

    this.set(payload)
    this._emit('error', payload)

    return this
  }

  /**
   * Set the action state to "done" and marks the action for clean
   * up, then set a payload if provided. Triggers the "done" event.
   * @return {Action} self
   */
  close (payload) {
    this.state = States.done | States.disposable

    this.set(payload)
    this._emit('done', this.payload)

    return this
  }

  /**
   * Set the action state to "cancelled" and marks the action for clean
   * up, then set a payload if provided. Triggers the "cancel" event.
   *
   * @return {Action} self
   */
  cancel () {
    this.state = States.cancelled | States.disposable

    this._emit('change')
    this._emit('cancel', this.payload)

    return this
  }

  /**
   * Toggles the disabled state, where the action will not
   * dispatch. This is useful in the Microcosm debugger to quickly
   * enable/disable actions. Triggers the "change" event.
   * @private
   */
  toggle () {
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
   */
  onError (callback, scope) {
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
   */
  onUpdate (callback, scope) {
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
   */
  onDone (callback, scope) {
    if (this.is(States.done)) {
      callback(this.payload, scope)
    } else {
      this.once('done', callback.bind(scope))
    }

    return this
  }

  /**
   * Listen for cancel. If the action has already cancelled, it will
   * execute the provided callback, otherwise it will wait and trigger
   * upon the "cancel" event.
   *
   * @param {Function} callback
   * @param {any} scope
   * @return {Action} self
   */
  onCancel (callback, scope) {
    if (this.is(States.cancelled)) {
      callback(this.payload, scope)
    } else {
      this.once('cancel', callback.bind(scope))
    }

    return this
  }

  /**
   * For interop with promises. Returns a promise that
   * resolves or rejects based on the action's resolution.
   * @return {Promise}
   */
  then (pass, fail) {
    return new Promise((resolve, reject) => {
      this.onDone(resolve)
      this.onError(reject)
    }).then(pass, fail)
  }

}
