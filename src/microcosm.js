/**
 * @fileoverview The Microcosm class provides a centralized place to
 * store application state, dispatch actions, and track changes.
 * @flow
 */

import Action from './action'
import Emitter, { type Callback } from './emitter'
import History from './history'
import DomainEngine from './domain-engine'
import EffectEngine from './effect-engine'
import CompareTree from './compare-tree'
import coroutine from './coroutine'
import assert from 'assert'
import installDevtools from './install-devtools'
import { RESET, PATCH, ADD_DOMAIN } from './lifecycle'
import { merge, set } from './utils'
import { version } from '../package.json'

/**
 * Options passed into Microcosm always extend from this object. You
 * can override this value to provide additional defaults for your
 * extension of Microcosm.
 */
const DEFAULTS = {
  maxHistory: 0,
  parent: null,
  batch: false,
  debug: false
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
export class Microcosm extends Emitter implements Domain {
  static defaults: Object
  static version: String

  parent: ?Microcosm
  initial: Object
  state: Object
  history: History
  snapshots: { [key: string]: Snapshot }
  domains: DomainEngine
  effects: EffectEngine
  changes: CompareTree
  options: Object
  active: boolean

  constructor(preOptions?: ?Object, state?: Object, deserialize?: boolean) {
    super()

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})

    this.parent = this.options.parent

    this.initial = this.parent ? this.parent.initial : this.getInitialState()
    this.state = this.parent ? this.parent.state : this.initial

    this.history = this.parent ? this.parent.history : new History(this.options)

    this.snapshots = Object.create(this.parent ? this.parent.snapshots : null)
    this.domains = new DomainEngine(this)
    this.effects = new EffectEngine(this)
    this.changes = new CompareTree(this.state)
    this.active = true

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
    this.setup(this.options)

    // If given state, reset to that snapshot
    if (state) {
      this.reset(state, deserialize)
    }

    if (this.options.debug) {
      installDevtools(this)
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
  setup(options?: Object) {
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
    return this.initial == null ? {} : this.initial
  }

  recall(action: ?Action): Object {
    if (action && action.id in this.snapshots) {
      return this.snapshots[action.id].next
    }

    return this.getInitialState()
  }

  /**
   * Get the state prior to a given action, but include any upstream
   * updates from parent Microcosms.
   */
  rebase(action: Action): Object {
    let state = this.recall(action.parent)

    if (this.parent) {
      state = merge(state, this.parent.recall(action))
    }

    return state
  }

  /**
   * Create the initial state snapshot for an action. This is important so
   * that, when rolling back to this action, it always has a state value.
   */
  createSnapshot(action: Action): Snapshot {
    let snapshot: Snapshot = {
      last: this.state,
      next: this.state,
      status: 'inactive',
      payload: undefined,
      disabled: action.disabled
    }

    this.snapshots[action.id] = snapshot

    return snapshot
  }

  /**
   * Update the state snapshot for a given action
   */
  updateSnapshot(action: Action) {
    let snap = this.snapshots[action.id]
    let last = this.rebase(action)

    if (!action.disabled) {
      snap.next = this.domains.dispatch(action, last, snap)
    } else {
      snap.next = last
    }

    this.snapshots[action.id] = merge(snap, {
      last,
      status: action.status,
      disabled: action.disabled,
      payload: action.payload
    })

    this.state = snap.next
  }

  /**
   * Remove the snapshot for a given action
   */
  removeSnapshot(action: Action) {
    delete this.snapshots[action.id]
  }

  dispatchEffect(action: Action) {
    this.effects.dispatch(action)
  }

  release() {
    this.changes.update(this.state)
  }

  on(type: *, callback: *, scope?: Object): this {
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

  off(type: string, callback: Callback, scope?: any): this {
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
  append(command: Command | Tagged, status?: Status): Action {
    return this.history.append(command, status)
  }

  /**
   * Resolves an action. Sends the result and any errors to a given error-first callback.
   * ```
   * repo.push(createPlanet, { name: 'Merkur' })
   * ```
   */
  push(command: Command, ...params: *): Action {
    let action = this.append(command)

    coroutine(action, command, params, this)

    assert(
      this.active,
      `Pushed "${action.toString()}" action, however this Microcosm has been shutdown. ` +
        "It's possible that an event subscription was not cleaned up."
    )

    return action
  }

  /**
   * Partially applies push. Successive calls will append new
   * parameters (see push())
   */
  prepare(command: Command, ...params: *) {
    return (...extra: *) => this.push(command, ...params, ...extra)
  }

  /**
   * Generates a domain based on the provided config and assigns it to
   * manage the provided key. Whenever this domain responds to an
   * action, it will be provided the current state for that particular
   * key.
   *
   * options passed as the third argument are sent into a domain’s setup
   * method and, if using a class, the constructor is instantiated with the
   * provided options and associated repo.
   */
  addDomain(key: string, config: *, options?: Object) {
    let domain = this.domains.add(key, config, options)
    let initial = domain.getInitialState ? domain.getInitialState() : null

    // $FlowFixMe
    this.initial = set(this.initial, key, initial)

    this.push(ADD_DOMAIN, domain)

    return domain
  }

  /**
   * Generates an effect based on the provided config. options passed as
   * the second argument are sent into a effect’s setup method and, if
   * using a class, the constructor is instantiated with the provided
   * options and associated repo.
   */
  addEffect(config: *, options?: Object) {
    return this.effects.add(config, options)
  }

  /**
   * Resets state. The new state is the result of folding the provided
   * data over getInitialState(). If no data is provided, the repo will
   * revert to this initial value. If the second argument is true,
   * Microcosm will call deserialize on the data.
   */
  reset(data: string | Object, deserialize?: boolean) {
    return this.push(RESET, data, deserialize)
  }

  /**
   * Merges a data payload into the existing state. If the second
   * argument is true, Microcosm will call deserialize on the data.
   */
  patch(data: string | Object, deserialize?: boolean) {
    return this.push(PATCH, data, deserialize)
  }

  /**
   * The default registration method for Microcosms
   */
  register() {
    return null
  }

  /**
   * For each key in the provided data parameter, transform it using
   * the deserialize method provided by the domain managing that
   * key. Then fold the deserialized data over the current repo state.
   */
  deserialize(payload: string | Object) {
    let base = payload

    if (this.parent) {
      base = this.parent.deserialize(payload)
    } else if (typeof base === 'string') {
      base = JSON.parse(base)
    }

    return this.domains.deserialize(base)
  }

  /**
   * Serialize the Microcosm’s state into a plain object. By default,
   * only domains that implement serialize will pass through their
   * tracked state.
   */
  serialize() {
    let base = this.parent ? this.parent.serialize() : {}

    return this.domains.serialize(this.state, base)
  }

  /**
   * Alias for serialize
   */
  toJSON() {
    return this.serialize()
  }

  /**
   * Change the current focal point of the history data structure used
   * by Microcosm. This is useful for undo/redo, or for debugging
   * purposes
   */
  checkout(action: Action) {
    this.history.checkout(action)

    return this
  }

  /**
   * Instantiate a new Microcosm that shares the same action history as
   * another. This is useful for producing “umbrellas” of Microcosms,
   * particularly within a tree of UI components.
   */
  fork() {
    return new Microcosm({
      parent: this
    })
  }

  /**
   * Close out a Microcosm
   */
  shutdown() {
    this.active = false

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

  parallel(actions: Action[]) {
    return this.append('GROUP').link(actions)
  }
}

Microcosm.version = version

export default Microcosm
