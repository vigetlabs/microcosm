import Archive         from './archive'
import CompareTree     from './compare-tree'
import DomainEngine    from './domain-engine'
import EffectEngine    from './effect-engine'
import Emitter         from './emitter'
import History         from './history'
import Task            from './task'
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
  get,
  set,
  update
} from './utils'

class Microcosm extends Emitter {
  constructor (options, state, deserialize)  {
    super()

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

  setup () {
    // NOOP
  }

  teardown () {
    this.effects.teardown()
    this.domains.teardown()

    // Trigger a teardown event before completely shutting down
    this._emit('teardown', this)

    // Remove this repo from history
    this.history.removeRepo(this)

    // Remove all listeners
    this.removeAllListeners()
  }

  getInitialState () {
    return this.initial
  }

  on (type, callback, scope) {
    let [event, meta=''] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.on(meta, callback, scope)
        break;
      default:
        Emitter.prototype.on.apply(this, arguments)
    }

    return this
  }

  off (type, callback, scope) {
    let [event, meta=''] = type.split(':', 2)

    switch (event) {
      case 'change':
        this.changes.off(meta, callback, scope)
        break;
      default:
        Emitter.prototype.off.apply(this, arguments)
    }

    return this
  }

  /**
   * Append a task to history and return it. This is used by push, but
   * also useful for testing specific task states.
   */
  append (action, status) {
    return this.history.append(action, status)
  }

  /**
   * Create a task for a given action.
   */
  push (action, ...params) {
    let task = this.append(action)

    coroutine(task, task.action.apply(null, params), this)

    return task
  }

  prepare (...params) {
    return (...extra) => this.push(...params, ...extra)
  }

  addDomain (key, config, options) {
    let domain = this.domains.add(key, config, options)

    if (domain.getInitialState) {
      this.initial = set(this.initial, key, domain.getInitialState())
    }

    this.push(ADD_DOMAIN, domain)

    return domain
  }

  addEffect (config, options) {
    return this.effects.add(config, options)
  }

  reset (data, deserialize) {
    return this.push(RESET, data, deserialize)
  }

  patch (data, deserialize) {
    return this.push(PATCH, data, deserialize)
  }

  deserialize (payload) {
    let base = payload

    if (this.parent) {
      base = this.parent.deserialize(payload)
    } else if (typeof base === 'string') {
      base = JSON.parse(base)
    }

    return this.domains.deserialize(base)
  }

  serialize () {
    let base = this.parent ? this.parent.serialize() : {}

    return this.domains.serialize(this.state, base)
  }

  toJSON () {
    return this.serialize()
  }

  checkout (task) {
    this.history.checkout(task)

    return this
  }

  fork () {
    return new Microcosm({
      parent : this
    })
  }

  recall (task, fallback) {
    return this.archive.get(task, fallback)
  }

  /**
   * Create the initial state snapshot for a task. This is important so
   * that, when rolling back to this task, it always has a state value.
   * @param {Task} task - The task to generate a snapshot for
   */
  createInitialSnapshot (task) {
    this.archive.create(task)
  }

  /**
   * Update the state snapshot for a given task
   * @param {Task} task The task to update the snapshot for
   */
  updateSnapshot (task, state) {
    this.archive.set(task, state)
  }

  /**
   * Remove the snapshot for a given task
   * @param {Task} task - The task to remove the snapshot for
   */
  removeSnapshot (task) {
    this.archive.remove(task)
  }

  reconcile (task) {
    let next = this.recall(task.parent, this.initial)

    if (this.parent) {
      next = merge(next, this.parent.recall(task))
    }

    if (!task.disabled) {
      next = this.domains.dispatch(next, task)
    }

    this.updateSnapshot(task, next)

    this.state = next
  }

  release (task) {
    this.changes.update(this.state)
    this.effects.dispatch(task)
  }

}

export default Microcosm

export { Microcosm, Task, History, tag, get, set, update, merge, getRegistration }
