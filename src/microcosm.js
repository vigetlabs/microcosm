import Action          from './action'
import Emitter         from './emitter'
import History         from './history'
import Realm           from './realm'
import createEffect    from './create-effect'
import tag             from './tag'
import coroutine       from './coroutine'
import getRegistration from './get-registration'

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
  extract,
  pipeline,
  toArray,
  compileKeyPaths
} from './utils'

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
   */
  getInitialState () {
    return this.realm.invoke('getInitialState', {})
  },

  /**
   * Dispatch an action to a list of domains. This is used by state management
   * methods, like `rollforward` and `getInitialState` to compute state.
   * Assuming there are no side-effects in domain handlers, this is pure.
   * Calling this method will not update repo state.
   */
  dispatch (state, action) {
    let handlers = this.realm.register(action)
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
          next = handler.call(domain, get(state, key), action.payload)
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
      this.state = merge(this.state, this.parent.state)
    }

    this.staged = this.dispatch(this.staged, action)
    this.state = this.commit(this.staged)

    if (this.state != original) {
      this.dirty = true
    }

    return this
  },

  /**
   * Publish a release if anything changed
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
   */
  append (behavior) {
    return this.history.append(behavior)
  },

  /**
   * Push an action into Microcosm. This will trigger the lifecycle for updating
   * state.
   */
  push (behavior/*, ... params */) {
    let action = this.append(behavior)
    let params = toArray(arguments, 1)

    coroutine(action, action.behavior.apply(null, params), this)

    return action
  },

  /**
   * Partially apply push
   */
  prepare (/*... params */) {
    let params = toArray(arguments)
    let repo = this

    return function () {
      let extra = toArray(arguments)

      repo.push.apply(repo, params.concat(extra))
    }
  },

  /**
   * Adds a domain to the Microcosm instance. A domain informs the
   * Microcosm how to process various action types. If no key is
   * given, the domain will operate on all application state.
   */
  addDomain (key, config, options) {
    this.follower = false

    let domain = this.realm.add(key, config, options)

    this.rebase(key)

    return domain
  },

  /**
   * An effect is a one-time handler that fires whenever an action changes. Callbacks
   * will only ever fire once, and can not modify state.
   */
  addEffect (config, options) {
    return createEffect(this, config, options)
  },

  /**
   * Push an action to reset the state of the instance. This state is folded
   * on to the result of `getInitialState()`.
   */
  reset (data, deserialize) {
    return this.push(RESET, data, deserialize)
  },

  /**
   * Deserialize a given state and reset the instance with that
   * processed state object.
   */
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

    return this.realm.invoke('deserialize', base, base)
  },

  serialize () {
    let base = this.parent ? this.parent.serialize() : {}

    return this.realm.invoke('serialize', this.staged, base)
  },

  /**
   * Alias serialize for JS interoperability.
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
  rebase (key) {
    this.archived = merge(this.getInitialState(), this.archived)
    this.cached = merge(this.archived, this.cached)

    return this.push(ADD_DOMAIN, key)
  },

  /**
   * Change the focus of the history tree. This allows for features
   * like undo and redo.
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
  index (name, fragment /*, ...processors*/) {
    let keyPaths = compileKeyPaths(fragment)
    let processors = toArray(arguments, 2)

    let state  = null
    let subset = null
    let answer = null

    var query = this.indexes[name] = () => {
      if (this.state !== state) {
        state = this.state

        let next = extract(state, keyPaths, subset)

        if (next !== subset) {
          subset = next
          answer = pipeline(subset, processors, state)
        }
      }

      return answer
    }

    return query
  },

  lookup (name) {
    let index = this.indexes[name]

    if (index == null) {
      if (this.parent) {
        return this.parent.lookup(name)
      } else {
        throw new TypeError('Unable to find missing index ' + name)
      }
    }

    return index
  },

  /**
   * Invoke an index, optionally adding additional processing.
   */
  compute (name /*, ...processors */) {
    let processors = toArray(arguments, 1)

    return pipeline(this.lookup(name)(), processors, this.state)
  },

  /**
  * Return a memoized compute function. This is useful for repeated
  * invocations of a computation as state changes. Useful for use inside
  * of Presenters.
   */
  memo (name /*, ...processors */) {
    let index = this.lookup(name)
    let processors = toArray(arguments, 1)
    let last = null
    let answer = null

    return () => {
      let next = index()

      if (next !== last) {
        last = next
        answer = pipeline(index(), processors, this.state)
      }

      return answer
    }
  }

})

export default Microcosm

export { Microcosm, Action, History, tag, get, set, merge, inherit, getRegistration }
