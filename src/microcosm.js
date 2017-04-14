import Action          from './action'
import Emitter         from './emitter'
import History         from './history'
import Archive         from './archive'
import DomainEngine    from './domain-engine'
import EffectEngine    from './effect-engine'
import CompareTree     from './compare-tree'
import coroutine       from './coroutine'
import getRegistration from './get-registration'
import tag             from './tag'

import {
  RESET,
  PATCH,
  ADD_DOMAIN
} from './lifecycle'

import {
  merge,
  inherit,
  get,
  set,
  update,
  isString
} from './utils'

function Microcosm (preOptions, state, deserialize)  {
  Emitter.call(this)

  let options = merge(Microcosm.defaults, this.constructor.defaults, preOptions)

  this.parent = options.parent

  this.initial = this.parent ? this.parent.initial : {}
  this.state = this.parent ? this.parent.state : this.initial

  this.history = this.parent ? this.parent.history : new History(options)

  this.archive = new Archive()
  this.domains = new DomainEngine(this)
  this.effects = new EffectEngine(this)
  this.changes = new CompareTree(this.state)

  // History moves through a set lifecycle. As that lifecycle occurs,
  // save snapshots of new state:

  // When an action is first created
  this.history.on('append', this.createSnapshot, this)

  // When an action snapshot needs updating
  this.history.on('update', this.updateSnapshot, this)

  // When an action snapshot should be removed
  this.history.on('remove', this.removeSnapshot, this)

  // When an action changes, it causes a reconcilation
  this.history.on('reconcile', this.dispatchEffect, this)

  // A history is done reconciling and is ready for a release
  this.history.on('release', this.release, this)

  // Microcosm is now ready. Call the setup lifecycle method
  this.setup(options)

  // If given state, reset to that snapshot
  if (state) {
    this.reset(state, deserialize)
  }
}

/**
 * Options passed into Microcosm always extend from this static
 * property. You can override this value to provide additional
 * defaults for your extension of Microcosm.
 */
Microcosm.defaults = {
  maxHistory: 0,
  parent: null,
  batch: false
}

inherit(Microcosm, Emitter, {

  setup () {
    // NOOP
  },

  teardown () {
    // NOOP
  },

  getInitialState () {
    return this.initial
  },

  recall (action, fallback) {
    return this.archive.get(action, fallback)
  },

  /**
   * Create the initial state snapshot for an action. This is important so
   * that, when rolling back to this action, it always has a state value.
   * @param {Action} action - The action to generate a snapshot for
   */
  createSnapshot (action) {
    this.archive.create(action)
  },

  /**
   * Update the state snapshot for a given action
   * @param {Action} action - The action to update the snapshot for
   */
  updateSnapshot (action) {
    let next = this.recall(action.parent, this.initial)

    if (this.parent) {
      next = merge(next, this.parent.recall(action))
    }

    if (!action.disabled) {
      next = this.domains.dispatch(next, action)
    }

    this.archive.set(action, next)

    this.state = next
  },

  /**
   * Remove the snapshot for a given action
   * @param {Action} action - The action to remove the snapshot for
   */
  removeSnapshot (action) {
    this.archive.remove(action)
  },

  dispatchEffect (action) {
    this.effects.dispatch(action)
  },

  release () {
    this.changes.update(this.state)
  },

  on (type, callback, scope) {
    let [event, meta] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.on(meta || '', callback, scope)
        break;
      default:
        Emitter.prototype.on.apply(this, arguments)
    }

    return this
  },

  off (type, callback, scope) {
    let [event, meta] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.off(meta || '', callback, scope)
        break;
      default:
        Emitter.prototype.off.apply(this, arguments)
    }

    return this
  },

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states.
   */
  append (command, status) {
    return this.history.append(command, status)
  },

  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   */
  push (command, ...params) {
    let action = this.append(command)

    coroutine(action, action.command, params, this)

    return action
  },

  prepare (...params) {
    return (...extra) => this.push(...params, ...extra)
  },

  addDomain (key, config, options) {
    let domain = this.domains.add(key, config, options)

    if (domain.getInitialState) {
      this.initial = set(this.initial, key, domain.getInitialState())
    }

    this.push(ADD_DOMAIN, domain)

    return domain
  },

  addEffect (config, options) {
    return this.effects.add(config, options)
  },

  reset (data, deserialize) {
    return this.push(RESET, data, deserialize)
  },

  patch (data, deserialize) {
    return this.push(PATCH, data, deserialize)
  },

  deserialize (payload) {
    let base = payload

    if (this.parent) {
      base = this.parent.deserialize(payload)
    } else if (isString(base)) {
      base = JSON.parse(base)
    }

    return this.domains.deserialize(base)
  },

  serialize () {
    let base = this.parent ? this.parent.serialize() : {}

    return this.domains.serialize(this.state, base)
  },

  toJSON () {
    return this.serialize()
  },

  checkout (action) {
    this.history.checkout(action)

    return this
  },

  fork () {
    return new Microcosm({
      parent : this
    })
  },

  /**
   * Close out a Microcosm:
   *
   * 1. Call teardown on the microcosm, domains and effects
   * 2. Trigger a teardown event
   * 3. Remove the microcosm from its associated history
   * 4. Clean up all listeners
   *
   * @private
   */
  shutdown () {
    this.teardown()

    this.effects.teardown()
    this.domains.teardown()

    // Trigger a teardown event before completely shutting down
    this._emit('teardown', this)

    // Stop tracking history
    this.history._removeScope(this)

    // Remove all listeners
    this.removeAllListeners()
  }

})

export default Microcosm

export { Microcosm, Action, History, tag, get, set, update, merge, inherit, getRegistration }
