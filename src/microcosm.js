/**
 * @fileoverview The Microcosm class provides a centralized place to
 * store application state, dispatch actions, and track changes.
 */
import Action from './action'
import Emitter from './emitter'
import History from './history'
import Archive from './archive'
import DomainEngine from './domain-engine'
import EffectEngine from './effect-engine'
import CompareTree from './compare-tree'
import coroutine from './coroutine'
import getRegistration from './get-registration'
import tag from './tag'
import { RESET, PATCH, ADD_DOMAIN } from './lifecycle'
import { merge, inherit, get, set, update, isString } from './utils'

/**
 * Options passed into Microcosm always extend from this object. You
 * can override this value to provide additional defaults for your
 * extension of Microcosm.
 * @private
 */
const DEFAULTS = {
  maxHistory: 0,
  parent: null,
  batch: false
}

/**
 * # Overview
 *
 * The Microcosm class provides a centralized place to store application
 * state, dispatch actions, and track changes.
 *
 * ### Creating a Microcosm
 *
 * All Microcosm apps start by instantiating a Microcosm class. We call
 * this instance of Microcosm a "repo":
 *
 * ```javascript
 * let repo = new Microcosm()
 * ```
 *
 * ### Options
 *
 * The first argument of the Microcosm constructor is an object of
 * options:
 *
 * ```javascript
 * let repo = new Microcosm({ maxHistory: 10 })
 * ```
 *
 * Microcosm supports the following options:
 *
 * 1. `maxHistory:number`: In Microcosm, data is changed by responding
 *    to [actions](./actions.md). This builds up a history that can be
 *    useful for debugging and undo/redo behavior. By default, Microcosm
 *    gets rid of any old actions to reduce memory usage. By setting
 *    `maxHistory`, you can tell Microcosm to hold on to those actions.
 * 2. `batch:boolean`: When set to true, change events within a short
 *    period of time will be grouped together
 *    using
 *    [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback). Defaults
 *    to false. **Important:** this makes change events asynchronous.
 * 2. `updater:function`: `batch:true` should be sufficient for nearly
 *    all use cases. However this option overrides the default batch
 *    behavior if it proves problematic for your app. See
 *    the [Batch Updates](../recipes/batch-updates.md) recipe for more
 *    information.
 *
 * Feel free to add additional options to fit your use case. Any options
 * you provide to Microcosm are passed into the `setup` lifecycle method:
 *
 * ```javascript
 * class Repo extends Microcosm {
 *
 *   setup (options) {
 *     console.log(options) // { autosave: true }
 *   }
 *
 * }
 *
 * let repo = new Repo({ autosave: true })
 * ```
 * @extends Emitter
 * @tutorial quickstart
 */
class Microcosm extends Emitter {
  constructor(preOptions, state, deserialize) {
    super()

    let options = merge(DEFAULTS, this.constructor.defaults, preOptions)

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
   * ### `setup(options)`
   *
   * Called whenever a Microcosm is instantiated. This provides a general
   * purpose hook for adding domains and other setup
   * behavior. Instantiation options are passed in as the first argument.
   *
   * ```javascript
   * class SolarSystem extends Microcosm {
   *   setup (options) {
   *     this.addDomain('planets', Planets)
   *   }
   * }
   * ```
   *
   * Setup receives options passed from instantiation. For example:
   *
   * ```javascript
   * class SolarSystem extends Microcosm {
   *   setup(options) {
   *     console.log(options) // { test: true }
   *   }
   * }
   *
   * let repo = new SolarSystem({ test: true })
   * ```
   */
  setup() {
    // NOOP
  }

  /**
   * Called whenever a Microcosm is shut down. Do any necessary clean up work within this callback.
   */
  teardown() {
    // NOOP
  }

  /**
   * Generates the starting state for a Microcosm instance. This is the result of dispatching `getInitialState` to all domains. It is pure; calling this function will not update state.
   */
  getInitialState() {
    return this.initial
  }

  recall(action, fallback) {
    return this.archive.get(action, fallback)
  }

  /**
   * Create the initial state snapshot for an action. This is important so
   * that, when rolling back to this action, it always has a state value.
   * @param {Action} action - The action to generate a snapshot for
   */
  createSnapshot(action) {
    this.archive.create(action)
  }

  /**
   * Update the state snapshot for a given action
   * @param {Action} action - The action to update the snapshot for
   */
  updateSnapshot(action) {
    let next = this.recall(action.parent, this.initial)

    if (this.parent) {
      next = merge(next, this.parent.recall(action))
    }

    if (!action.disabled) {
      next = this.domains.dispatch(next, action)
    }

    this.archive.set(action, next)

    this.state = next
  }

  /**
   * Remove the snapshot for a given action
   * @param {Action} action - The action to remove the snapshot for
   */
  removeSnapshot(action) {
    this.archive.remove(action)
  }

  dispatchEffect(action) {
    this.effects.dispatch(action)
  }

  release() {
    this.changes.update(this.state)
  }

  on(type, callback, scope) {
    let [event, meta] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.on(meta || '', callback, scope)
        break
      default:
        Emitter.prototype.on.apply(this, arguments)
    }

    return this
  }

  off(type, callback, scope) {
    let [event, meta] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.off(meta || '', callback, scope)
        break
      default:
        Emitter.prototype.off.apply(this, arguments)
    }

    return this
  }

  /**
   * Append an action to history and return it. This is used by push,
   * but also useful for testing action states.
   * ```
   * let action = repo.append(createPlanet)
   *
   * // Test that opening an action for a planet marks
   * // that planet as loading
   * action.open({ id: 'pluto' })
   * assert.equal(repo.state.planets.pluto.loading, true)
   *
   * // And then test that closing the action moves marks
   * // the planet as no longer loading
   * action.resolve({ id: 'pluto' })
   * assert.falsy(repo.state.planets.pluto.loading)
   * ```
   */
  append(command, status) {
    return this.history.append(command, status)
  }

  /**
   * Resolves an action. Sends the result and any errors to a given error-first callback.
   * ```
   * repo.push(createPlanet, { name: 'Merkur' })
   * ```
   */
  push(command, ...params) {
    let action = this.append(command)

    coroutine(action, action.command, params, this)

    return action
  }

  prepare(...params) {
    return (...extra) => this.push(...params, ...extra)
  }

  addDomain(key, config, options) {
    let domain = this.domains.add(key, config, options)

    if (domain.getInitialState) {
      this.initial = set(this.initial, key, domain.getInitialState())
    }

    this.push(ADD_DOMAIN, domain)

    return domain
  }

  addEffect(config, options) {
    return this.effects.add(config, options)
  }

  reset(data, deserialize) {
    return this.push(RESET, data, deserialize)
  }

  patch(data, deserialize) {
    return this.push(PATCH, data, deserialize)
  }

  deserialize(payload) {
    let base = payload

    if (this.parent) {
      base = this.parent.deserialize(payload)
    } else if (isString(base)) {
      base = JSON.parse(base)
    }

    return this.domains.deserialize(base)
  }

  serialize() {
    let base = this.parent ? this.parent.serialize() : {}

    return this.domains.serialize(this.state, base)
  }

  toJSON() {
    return this.serialize()
  }

  checkout(action) {
    this.history.checkout(action)

    return this
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }

  /**
   * Close out a Microcosm
   * @private
   */
  shutdown() {
    // Call teardown on the Microcosm
    this.teardown()

    // Trigger a teardown event before completely shutting
    // down. Signalling teardown on domains and effects
    this._emit('teardown', this)

    // Stop tracking history
    this.history._removeScope(this)

    // Remove all listeners
    this.removeAllListeners()
  }

  parallel(actions) {
    return this.append('GROUP').link(actions)
  }
}

export default Microcosm

export {
  Microcosm,
  Action,
  History,
  tag,
  get,
  set,
  update,
  merge,
  inherit,
  getRegistration
}
