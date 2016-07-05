import Emitter   from './emitter'
import States    from './action/states'
import coroutine from './action/coroutine'
import tag       from './action/tag'

const identity = n => n

/**
 * Actions are the result of using `push()` within a Microcosm
 * instance. They are dispatched to stores to produce new state.
 *
 * @example
 *     new Action(id => promiseAjax.get(id))
 *     new Action(lifecycle.willStart)
 *
 * @api private
 *
 * @param {Function} behavior - how the action should resolve.
 */
export default function Action (behavior) {
  this.behavior = tag(behavior)
}

Action.prototype = {

  constructor : Action,

  behavior : identity,
  depth    : 0,
  parent   : null,
  next     : null,
  left     : null,
  right    : null,
  state    : States.unset,

  /**
   * Check the state of the action to determine what `type` should be
   * dispatched to stores for processing (via register()).
   *
   * @api private
   *
   * @returns {String|Null} The action type to dspatch.
   */
  get type() {
    if (this.is(States.disabled))  return null
    if (this.is(States.cancelled)) return this.behavior.cancelled
    if (this.is(States.failed))    return this.behavior.failed
    if (this.is(States.done))      return this.behavior.done
    if (this.is(States.loading))   return this.behavior.loading
    if (this.is(States.open))      return this.behavior.open

    return null
  },

  /**
   * Get all child actions, those dispatched after this one within
   * history. This is used by the Microcosm debugger to visualize
   * action history as a DAG.
   *
   * @api private
   *
   * @returns {Array} children list of actions
   */
  get children() {
    let start = this.next
    let nodes = []

    while (start) {
      nodes.push(start)
      start = start.right
    }

    return nodes
  },

  /**
   * Given a string or State constant, determine if the `state` bitmask for
   * the action includes the provided type.
   *
   * @example
   *    action.is('done')
   *    action.is(State.DONE | State.CANCELLED)
   *
   * @api private
   *
   * @param {String|Number} type - Either a string key or numeric type
   * @returns {Boolean} does the action match the given types?
   */
  is (type) {
    if (typeof type === 'string') {
      type = States[type]
    }

    return (this.state & type) === type
  },

  /**
   * Evaluate the action by invoking the action's behavior with
   * provided parameters. Then pass that value into the `coroutine`
   * function, which will update the state of the action as it
   * processes.
   *
   * @api private
   */
  execute(/** params **/) {
    coroutine(this, this.behavior.apply(this, arguments))
  },

  /**
   * If defined, sets the payload for the action and triggers a
   * "change" event.
   *
   * @api private
   */
  set(payload) {
    if (payload != undefined) {
      this.payload = payload
    }

    this._emit('change')
  },

  /**
   * Set the action state to "open", then set a payload if
   * provided. Triggers the "open" event.
   *
   * @api public
   */
  open(payload) {
    this.state = States.open
    this.set(payload)
    this._emit('open', this.payload)
  },

  /**
   * Set the action state to "loading", then set a payload if
   * provided. Triggers the "update" event.
   *
   * @api public
   */
  send(payload) {
    this.state = States.loading
    this.set(payload)
    this._emit('update', payload)
  },

  /**
   * Set the action state to "failed" and marks the action for clean
   * up, then set a payload if provided. Triggers the "error" event.
   *
   * @api public
   */
  reject(payload) {
    this.state = States.failed | States.disposable
    this.set(payload)
    this._emit('error', payload)
  },

  /**
   * Set the action state to "done" and marks the action for clean
   * up, then set a payload if provided. Triggers the "done" event.
   *
   * @api public
   */
  close(payload) {
    this.state = States.done | States.disposable
    this.set(payload)
    this._emit('done', this.payload)
  },

  /**
   * Set the action state to "cancelled" and marks the action for clean
   * up, then set a payload if provided. Triggers the "cancel" event.
   *
   * @api public
   */
  cancel() {
    this.state = States.cancelled | States.disposable
    this._emit('change')
    this._emit('cancel', this.payload)
  },

  /**
   * Toggles the disabled state, where the action will not
   * dispatch. This is useful in the Microcosm debugger to quickly
   * enable/disable actions. Triggers the "change" event.
   *
   * @api public
   */
  toggle() {
    this.state ^= States.disabled
    this._emit('change')
  },

  /**
   * Listen to failure. If the action has already failed, it will
   * execute the provided callback, otherwise it will wait and trigger
   * upon the "error" event.
   *
   * @api public
   *
   * @param {Function} callback
   * @param {any} scope
   *
   * @returns {Action} self
   */
  onError(callback, scope) {
    if (this.is(States.failed)) {
      callback(this.payload, scope)
    } else {
      this.once('error', callback.bind(scope))
    }

    return this
  },

  /**
   * Listen to progress. Wait and trigger a provided callback on the "update" event.
   *
   * @api public
   *
   * @param {Function} callback
   * @param {any} scope
   *
   * @returns {Action} self
   */
  onUpdate(callback, scope) {
    this.listen('update', callback.bind(scope))

    return this
  },

  /**
   * Listen for completion. If the action has already completed, it will
   * execute the provided callback, otherwise it will wait and trigger
   * upon the "done" event.
   *
   * @api public
   *
   * @param {Function} callback
   * @param {any} scope
   *
   * @returns {Action} self
   */
  onDone(callback, scope) {
    if (this.is(States.done)) {
      callback(this.payload, scope)
    } else {
      this.once('done', callback.bind(scope))
    }

    return this
  }

}

Emitter(Action.prototype)
