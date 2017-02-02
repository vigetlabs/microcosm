import Action       from './action'
import Emitter      from './emitter'
import History      from './history'
import Realm        from './realm'
import createEffect from './create-effect'
import lifecycle    from './lifecycle'
import tag          from './tag'
import coroutine    from './coroutine'

import {
  merge,
  inherit,
  get,
  set,
  extract,
  compileKeyPaths
} from './utils'

/**
 * A tree-like data structure that keeps track of the execution order of
 * actions that are pushed into it, sequentially folding them together to
 * produce an object that can be rendered by a presentation library (such as
 * React).
 * @constructor
 * @extends {Emitter}
 */
function Microcosm (options, state, deserialize)  {
  Emitter.call(this)

  options = options || {}

  this.parent = options.parent || null
  this.history = this.parent ? this.parent.history : new History(options.maxHistory)
  this.history.addRepo(this)

  this.realm = new Realm(this)

  // Keeps track of the root of the history tree
  this.archived = this.parent ? this.parent.archived : {}

  // Keeps track of the focal point of the
  this.cached = this.parent ? this.parent.cached : this.archived

  // Staging. Internal domain state
  this.staged = this.parent ? this.parent.state : this.cached

  // Publically available data.
  this.state = this.parent ? this.parent.state : this.staged

  // Mark children as "followers". Followers do not move through the entire
  // lifecycle. They don't have to. This greatly improves fork performance.
  this.follower = !!this.parent

  this.indexes = {}

  // Track changes with a mutable flag
  this.dirty = false

  // Microcosm is now ready. Call the setup lifecycle method
  this.setup(options)

  // If given state, reset to that snapshot
  if (state) {
    this.reset(state, deserialize)
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
   * Roll back to the last archive
   */
  unarchive () {
    this.cached = this.archived
  },

  /**
   * Roll back to the last cache
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

    this.staged = this.dispatch(this.staged, action.type, action.payload)

    if (this.cached !== this.staged) {
      this.state = this.commit(this.staged)
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
    let action = this.append(behavior)

    coroutine(action, action.behavior.apply(null, params), this)

    return action
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
    this.follower = false

    this.realm.add(key, domain, options)
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
    this.follower = false

    return this.realm.reset(data, deserialize)
  },

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   * @param {Object} data - A raw state object to deserialize and apply to the instance
   * @param {Object} deserialize - Should the data be deserialized?
   * @return {Action} action - An action representing the patch operation.
   */
  patch (data, deserialize) {
    this.follower = false

    return this.realm.patch(data, deserialize)
  },

  /**
   * Deserialize a given payload by asking every domain how to it
   * should process it (via the deserialize domain function).
   * @param {Object} payload - A raw object to deserialize.
   * @return {Object} The deserialized version of the provided payload.
   */
  deserialize (payload) {
    let base = payload ? payload : {}

    if (typeof base === 'string') {
      base = JSON.parse(base)
    }

    if (this.parent) {
      base = this.parent.deserialize(base)
    }

    return this.dispatch(base, lifecycle.deserialize, base)
  },

  /**
   * Serialize application state by asking every domain how to
   * serialize the state they manage (via the serialize domain
   * function).
   * @return {Object} The serialized version of repo state.
   */
  serialize () {
    let base = this.staged

    if (this.parent) {
      base = merge(base, this.parent.serialize())
    }

    return this.dispatch(base, lifecycle.serialize, null)
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
    let payload = this.getInitialState()

    this.cached = merge(this.cached, payload)

    return this.realm.rebase(payload)
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
      parent : this
    })
  },

  /**
   * Memoize a computation of a fragment of application state.
   * This may be referenced when computing properties or querying
   * state within Presenters.
   */
  index (name, ...args) {
    this.indexes[name] = this.query(...args)

    return this.indexes[name]
  },

  /**
   * Invoke an index, optionally adding additional processing.
   */
  compute (index, ...processors) {
    if (this.indexes.hasOwnProperty(index) === false) {
      throw new TypeError('Unable to compute missing index ' + index)
    }

    let initial = this.indexes[index]()

    return processors.reduce((value, next) => {
      return next.call(this, value, this.state)
    }, initial)
  },

  /**
  * Return a memoized compute function. This is useful for repeated
  * invocations of a computation as state changes. Useful for use inside
  * of Presenters.
   */
  memo (...args) {
    return () => this.compute(...args)
  },

  /**
   * Return a memoized version of extract. Optionally
   * add additional processing.
   */
  query (fragment, ...processors) {
    let keyPaths = compileKeyPaths(fragment)

    let subset = null
    let answer = null

    return () => {
      let next = extract(this.state, keyPaths, subset)

      if (next !== subset) {
        subset = next

        answer = processors.reduce((value, fn) => {
          return fn.call(this, value, this.state)
        }, subset)
      }

      return answer
    }
  }

})

export default Microcosm

export { Microcosm, Action, History, tag, get, set, merge, inherit }
