import Action       from './action'
import Emitter      from './emitter'
import History      from './history'
import Realm        from './realm'
import createEffect from './create-effect'
import lifecycle    from './lifecycle'
import tag          from './tag'

import {
  merge,
  inherit,
  get,
  set
} from './utils'

const DEFAULT_OPTIONS = { maxHistory: 0, history: null, parent: null }

/**
 * A tree-like data structure that keeps track of the execution order of
 * actions that are pushed into it, sequentially folding them together to
 * produce an object that can be rendered by a presentation library (such as
 * React).
 * @constructor
 * @extends {Emitter}
 */
function Microcosm ({ maxHistory, history, parent } = DEFAULT_OPTIONS, state)  {
  Emitter.call(this)

  this.history = history || new History(maxHistory)
  this.history.addRepo(this)

  this.realm = new Realm(this)

  this.parent = parent || null

  // Keeps track of the root of the history tree
  this.archived = parent ? parent.archived : {}

  // Keeps track of the focal point of the
  this.cached = parent ? parent.cached : this.archived

  // Staging. Internal domain state
  this.staged = parent ? parent.state : this.cached

  // Publically available data.
  this.state = parent ? parent.state : this.staged

  // Mark children as "followers". Followers do not move through the entire
  // lifecycle. They don't have to. This greatly improves fork performance.
  this.follower = !!parent

  // Track changes with a mutable flag
  this.dirty = false

  // Microcosm is now ready. Call the setup lifecycle method
  this.setup()

  // If given state, reset to that snapshot
  if (state) {
    this.reset(state, true)
  }
}

inherit(Microcosm, Emitter, {

  /**
   * Called whenever a Microcosm is instantiated. This allows for prep without
   * using a constructor.
   */
  setup () {
    // NOOP
  },

  /**
   * Remove all subscriptions
   */
  teardown () {
    // Trigger a teardown event before completely shutting down
    this._emit('teardown', this)

    // Remove this repo from history
    this.history.removeRepo(this)

    // Remove all listeners
    this.removeAllListeners()
  },

  /**
   * Generates the starting state for a Microcosm instance by asking every
   * domain that subscribes to `getInitialState`.
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, lifecycle.getInitialState, null)
  },

  /**
   * Dispatch an action to a list of domains. This is used by state management
   * methods, like `rollforward` and `getInitialState` to compute state.
   * Assuming there are no side-effects in domain handlers, this is pure.
   * Calling this method will not update repo state.
   */
  dispatch (state, type, payload) {
    let handlers = this.realm.register(type)
    let current = state

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler, length } = handlers[i]

      var next = null

      switch (length) {
        case 0:
          next = handler.call(domain)
          break;
        case 1:
          next = handler.call(domain, get(state, key))
          break;
        case 2:
        default:
          next = handler.call(domain, get(state, key), payload)
      }

      current = set(current, key, next)
    }

    return current
  },


  /**
   * Rollback to the last cache
   */
  rollback () {
    this.staged = this.cached
  },

  /**
   * Update the cache point, this is called when the history tree
   * moves forward the current cache point.
   */
  cache (archive) {
    this.cached = this.staged

    if (archive) {
      this.archived = this.cached
    }
  },

  /**
   * Identify the last and next staged state, then ask the associated domain
   * if it should commit it. If so, roll state forward.
   */
  commit (staged) {
    let domains = this.realm.domains
    let next = staged

    for (var i = 0, len = domains.length; i < len; i++) {
      var [key, domain] = domains[i]

      next = this.write(next, key, domain)
    }

    return next
  },

  /**
   * Write state
   */
  write (state, key, domain) {
    if (domain.commit != null) {
      let next = get(state, key)

      // This gives libraries such as ImmutableJS a chance to serialize
      // into a primitive JavaScript form before being publically exposed.
      if (domain.shouldCommit != null) {
        let last = get(this.cached, key)

        // Revert to the current public state if not committing
        if (!domain.shouldCommit(last, next)) {
          return set(state, key, get(this.state, key))
        }
      }

      return set(state, key, domain.commit(next, state))
    }

    return state
  },

  /**
   * Run through the action history, dispatching their associated
   * types and payloads to domains for processing. Emits "change".
   */
  reconcile (action) {
    if (this.follower) {
      this.state = this.parent.state
      this.dirty = this.parent.dirty

      return this
    }

    let original = this.state

    // Update children with their parent's state
    if (this.parent) {
      this.staged = merge(this.staged, this.parent.state)
      this.state  = merge(this.state, this.parent.state)
    }

    let next = this.dispatch(this.staged, action.type, action.payload)

    if (this.staged !== next) {
      this.staged = next
      this.state = this.commit(next)
    }

    if (this.state != original) {
      this.dirty = true
    }

    return this
  },

  /**
   * Publish a release if anything changed
   * @param {Action} action
   */
  release (action) {
    if (action) {
      this._emit('effect', action)
    }

    if (this.dirty) {
      this.dirty = false
      this._emit('change', this.state)
    }
  },

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states.
   * @param {Function} behavior - An action function
   * @return {Action} action representation of the invoked function
   */
  append (behavior) {
    return this.history.append(behavior)
  },

  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   * @param {Function} behavior - An action function
   * @param {...Any} params - Parameters to invoke the type with
   * @return {Action} action representaftion of the invoked function
   */
  push (behavior, ...params) {
    return this.append(behavior).execute(params, this)
  },

  /**
   * Partially apply push
   * @param {...Any} params - Parameters to invoke the type with
   * @return {Function} A partially applied push function
   */
  prepare (...params) {
    return this.push.bind(this, ...params)
  },

  /**
   * Adds a domain to the Microcosm instance. A domain informs the
   * microcosm how to process various action types. If no key
   * is given, the domain will operate on all application state.
   * @param {String|null} key - The namespace within application state for the domain.
   * @param {Object|Function} domain  Configuration options to create a domain
   * @return {Microcosm} self
   */
  addDomain (key, domain, options) {
    this.realm.add(key, domain, options)

    this.follower = false
    this.rebase()

    return this
  },

  /**
   * An effect is a one-time handler that fires whenever an action changes. Callbacks
   * will only ever fire once, and can not modify state.
   * @param {Object|Function} effect - Configuration options to create an effect
   * @param {Object} options - Options to pass to the effect
   * @return {Microcosm} self
   */
  addEffect (effect, options) {
    createEffect(this, effect, options)

    return this
  },

  /**
   * Push an action to reset the state of the instance. This state is folded
   * on to the result of `getInitialState()`.
   * @param {Object} data - A new state object to apply to the instance
   * @param {Boolean} deserialize - Should the data be deserialized?
   * @return {Action} action - An action representing the reset operation.
   */
  reset (data, deserialize) {
    if (deserialize === true) {
      data = this.deserialize(data)
    }

    this.follower = false

    return this.push(lifecycle._willReset, {
      owner : this,
      data  : merge(this.getInitialState(), data)
    })
  },

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   * @param {Object} data - A raw state object to deserialize and apply to the instance
   * @param {Object} deserialize - Should the data be deserialized?
   * @return {Action} action - An action representing the patch operation.
   */
  patch (data, deserialize) {
    if (deserialize === true) {
      data = this.deserialize(data)
    }

    this.follower = false

    return this.push(lifecycle._willPatch, { data, owner: this })
  },

  /**
   * Deserialize a given payload by asking every domain how to it
   * should process it (via the deserialize domain function).
   * @param {Object} payload - A raw object to deserialize.
   * @return {Object} The deserialized version of the provided payload.
   */
  deserialize (payload) {
    if (payload == null) {
      return {}
    }

    return this.dispatch(payload, lifecycle.deserialize, payload)
  },

  /**
   * Serialize application state by asking every domain how to
   * serialize the state they manage (via the serialize domain
   * function).
   * @return {Object} The serialized version of repo state.
   */
  serialize () {
    return this.dispatch(this.staged, lifecycle.serialize, null)
  },

  /**
   * Alias serialize for JS interoperability.
   * @return {Object} result of `serialize`.
   */
  toJSON () {
    return this.serialize()
  },

  /**
   * Recalculate initial state by back-filling the cache object with
   * the result of getInitialState(). This is used when a domain is
   * added to Microcosm to ensure the initial state of the domain is
   * respected. Emits a "change" event.
   */
  rebase () {
    let data = this.getInitialState()

    this.cached = merge(this.cached, data)

    this.push(lifecycle._willRebase, { data, owner: this })
  },

  /**
   * Change the focus of the history tree. This allows for features
   * like undo and redo.
   * @param {Action} action to checkout
   * @return {Microcosm} self
   */
  checkout (action) {
    this.cached = this.archived

    this.history.checkout(action)

    return this
  },

  /**
   * Create a copy of this Microcosm, passing in the same history and
   * a reference to itself. As actions are pushed into the shared history,
   * each Microcosm will resolve differently.
   */
  fork () {
    return new Microcosm({
      parent  : this,
      history : this.history
    })
  }

})

export default Microcosm

export { Microcosm, Action, History, tag, merge, inherit }
