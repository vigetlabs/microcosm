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
  update
} from './utils'

function Microcosm (options, state, deserialize)  {
  Emitter.call(this)

  options = options || {}

  this.parent = options.parent || null

  this.history = this.parent ? this.parent.history : new History(options.maxHistory)
  this.history.addRepo(this)

  this.archive = new Archive()
  this.domains = new DomainEngine(this)
  this.effects = new EffectEngine(this)
  this.changes = new CompareTree(this.state)

  this.initial = this.parent ? this.parent.initial : {}
  this.state = this.parent ? this.parent.state : this.initial

  // Microcosm is now ready. Call the setup lifecycle method
  this.setup(options)

  // If given state, reset to that snapshot
  if (state) {
    this.reset(state, deserialize)
  }
}

inherit(Microcosm, Emitter, {

  setup () {
    // NOOP
  },

  teardown () {
    this.effects.teardown()
    this.domains.teardown()

    // Trigger a teardown event before completely shutting down
    this._emit('teardown', this)

    // Remove this repo from history
    this.history.removeRepo(this)

    // Remove all listeners
    this.removeAllListeners()
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
  createInitialSnapshot (action) {
    this.archive.create(action)
  },

  /**
   * Update the state snapshot for a given action
   * @param {Action} action - The action to update the snapshot for
   */
  updateSnapshot (action, state) {
    this.archive.set(action, state)
  },

  /**
   * Remove the snapshot for a given action
   * @param {Action} action - The action to remove the snapshot for
   */
  removeSnapshot (action) {
    this.archive.remove(action)
  },

  reconcile (action) {
    let next = this.recall(action.parent, this.initial)

    if (this.parent) {
      next = merge(next, this.parent.recall(action))
    }

    if (!action.disabled) {
      next = this.domains.dispatch(next, action)
    }

    this.updateSnapshot(action, next)

    this.state = next
  },

  release (action) {
    this.changes.update(this.state)
    this.effects.dispatch(action)
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
        this.changes.off(meta, callback, scope)
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

    coroutine(action, action.command.apply(null, params), this)

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
    } else if (typeof base === 'string') {
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
  }

})

export default Microcosm

export { Microcosm, Action, History, tag, get, set, update, merge, inherit, getRegistration }
