import Action     from './action'
import Emitter    from './emitter'
import History    from './history'
import MetaDomain from './domains/meta'
import Realm      from './realm'
import Effects    from './effects'
import lifecycle  from './lifecycle'
import tag        from './tag'

import {
  merge,
  inherit,
  get,
  set
} from './utils'

const GET_INITIAL_STATE = { type: lifecycle.getInitialState, payload: null }

const DEFAULT_OPTIONS = { maxHistory: 0, history: null, parent: null }

/**
 * A tree-like data structure that keeps track of the execution order of
 * actions that are pushed into it, sequentially folding them together to
 * produce an object that can be rendered by a presentation library (such as
 * React).
 * @extends {Emitter}
 */
function Microcosm ({ maxHistory, history, parent } = DEFAULT_OPTIONS)  {
  Emitter.apply(this, arguments)

  this.history = history || new History(maxHistory)

  this.realm = new Realm(this)
  this.effects = new Effects(this)

  this.parent = parent || null

  this.history.addRepo(this)

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

  // Track the current revision against the published version
  this.revision = 0
  this.published = 0

  // Setup a domain to handle patch and reset actions
  this.addDomain(null, MetaDomain)

  // Microcosm is now ready. Call the setup lifecycle method
  this.setup()
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
  teardown() {
    // Trigger a teardown event before completely shutting down
    this._emit('teardown')

    // Remove this repo from history
    this.history.removeRepo(this)

    // Remove all listeners
    this.removeAllListeners()
  },

  /**
   * Generates the starting state for a Microcosm instance by asking every
   * domain that subscribes to `getInitialState`.
   *
   * @return {Object} State object representing the initial state.
   */
  getInitialState () {
    return this.dispatch({}, GET_INITIAL_STATE)
  },

  /**
   * Dispatch an action to a list of domains. This is used by state management
   * methods, like `rollforward` and `getInitialState` to compute state.
   * Assuming there are no side-effects in domain handlers, this is pure.
   * Calling this method will not update repo state.
   */
  dispatch (state, { type, payload }) {
    let handlers = this.realm.register(type)
    let current = state

    for (var i = 0, len = handlers.length; i < len; i++) {
      var { key, domain, handler } = handlers[i]

      var last = get(state, key)
      var next = handler.call(domain, last, payload)

      if (next !== last) {
        current = set(current, key, next)
      }
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
    return this.realm.reduce(this.write, staged, this)
  },

  /**
   * Write state
   */
  write (state, key, domain) {
    if (typeof domain.commit === 'function') {
      let next = get(state, key)

      // This gives libraries such as ImmutableJS a chance to serialize
      // into a primitive JavaScript form before being publically exposed.
      if (domain.shouldCommit) {
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
    if (this.follower && this.state !== this.parent.state) {
      this.revision += 1
      this.state = this.parent.state

      return this
    }

    let original = this.state

    // Update children with their parent's state
    if (this.parent) {
      this.staged = merge(this.staged, this.parent.state)
      this.state  = merge(this.state, this.parent.state)
    }

    if (this.realm.respondsTo(action)) {
      this.staged = this.dispatch(this.staged, action)
      this.state = this.commit(this.staged)
    }

    if (this.state != original) {
      this.revision += 1
    }

    return this
  },

  release (action) {
    if (action) {
      this.effect(action)
    }

    if (this.revision > this.published) {
      this.revision = this.published
      this._emit('change', this.state)
    }
  },

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states.
   *
   * @param {Function} behavior - An action function
   * @return {Action} action representation of the invoked function
   */
  append (behavior) {
    return this.history.append(behavior)
  },

  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   *
   * @param {Function} behavior - An action function
   * @param {...Array} params - Parameters to invoke the type with
   * @return {Action} action representation of the invoked function
   */
  push (behavior, ...params) {
    return this.append(behavior).execute(params)
  },

  /**
   * Partially apply push
   *
   * @param {...Array} params - Parameters to invoke the type with
   * @return {Function} A partially applied push function
   */
  prepare (...params) {
    return this.push.bind(this, ...params)
  },

  /**
   * Adds a domain to the Microcosm instance. A domain informs the
   * microcosm how to process various action types. If no key
   * is given, the domain will operate on all application state.
   *
   * @param {String} key - The namespace within application state for the domain.
   * @param {Object|Function} config - Configuration options for the domain
   * @return {Microcosm} self
   */
  addDomain (key, domain, options) {
    this.realm.add(key, domain, options)

    if (domain !== MetaDomain) {
      this.follower = false
      this.rebase()
    }

    return this
  },

  /**
   * An effect is a one-time handler that fires whenever an action changes. Callbacks
   * will only ever fire once, and can not modify state.
   *
   * @param {Object} config - Configuration for the effect
   * @param {Object} options - Options to pass to the effect
   * @return {Microcosm} self
   */
  addEffect (effect, options) {
    this.effects.add(effect, options)

    return this
  },

  /**
   * Trigger an effect
   */
  effect (action) {
    this.effects.trigger(action)
  },

  /**
   * Push an action to reset the state of the instance. This state is folded
   * on to the result of `getInitialState()`.
   *
   * @param {Object} state - A new state object to apply to the instance
   * @param {Object} deserialize - Should the data be deserialized?
   * @return {Action} action - An action representing the reset operation.
   */
  reset (data, deserialize) {
    if (deserialize === true) {
      data = this.deserialize(data)
    }

    this.follower === false

    return this.push(lifecycle._willReset, {
      owner : this,
      data  : merge(this.getInitialState(), data)
    })
  },

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   *
   * @param {Object} data - A raw state object to deserialize and apply to the instance
   * @param {Object} deserialize - Should the data be deserialized?
   * @return {Action} action - An action representing the patch operation.
   */
  patch (data, deserialize) {
    if (deserialize === true) {
      data = this.deserialize(data)
    }

    this.follower === false

    return this.push(lifecycle._willPatch, {
      owner : this,
      data  : data
    })
  },

  /**
   * Deserialize a given payload by asking every domain how to it
   * should process it (via the deserialize domain function).
   *
   * @param {Object} payload - A raw object to deserialize.
   * @return {Object} The deserialized version of the provided payload.
   */
  deserialize (payload) {
    if (payload == null) {
      return {}
    }

    return this.dispatch(payload, { type: lifecycle.deserialize, payload })
  },

  /**
   * Serialize application state by asking every domain how to
   * serialize the state they manage (via the serialize domain
   * function).
   *
   * @return {Object} The serialized version of repo state.
   */
  serialize () {
    return this.dispatch(this.staged, { type: lifecycle.serialize, payload: null })
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
   *
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
