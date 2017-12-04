/**
 * @flow
 */

import Subject from './subject'
import History from './history'
import DomainEngine from './domain-engine'
import EffectEngine from './effect-engine'
import installDevtools from './install-devtools'
import tag from './tag'
import { merge, clone } from './utils'
import { version } from '../package.json'

const DEFAULTS = {
  debug: false,
  parent: null
}

class Microcosm extends Subject {
  static defaults: Object
  static version: String

  parent: ?Microcosm
  history: History
  options: Object

  _snapshots: Object
  _domains: DomainEngine
  _effects: EffectEngine

  constructor(preOptions?: ?Object) {
    super()

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})

    this.parent = this.options.parent
    this.history = this.parent ? this.parent.history : new History(this.options)

    this._snapshots = {}
    this._domains = new DomainEngine(this)
    this._effects = new EffectEngine(this)

    this.subscribe({
      start: () => this.setup(this.options),
      complete: () => this.teardown()
    })

    // A history is done reconciling and is ready for a release
    this.history.releases.subscribe(() => {
      this.observer.next(this.state)
    })

    this.history.updates.subscribe(next => {
      this._updateSnapshotRange(next)
      this._effects.dispatch(next)
    })

    if (this.options.debug) {
      installDevtools(this)
    }
  }

  get state(): Object {
    return this._snapshots[this.history.head] || this.getInitialState()
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  getInitialState() {
    let state = this._domains.getInitialState()

    return this.parent ? merge(this.parent.getInitialState(), state) : state
  }

  push(command: any, ...params: *[]): Action {
    return this.history.append(command, params, this)
  }

  addDomain(key: string, config: *, options?: Object) {
    return this._domains.add(key, config, options)
  }

  addEffect(config: *, options?: Object) {
    return this._effects.add(config, options)
  }

  deserialize(payload: string | Object) {
    let base = payload

    if (typeof base === 'string') {
      base = JSON.parse(base)
    }

    if (this.parent) {
      base = merge(base, this.parent.deserialize(base))
    }

    return clone(this._domains.deserialize(base))
  }

  toJSON() {
    let base = this.parent ? this.parent.toJSON() : null

    return merge(this._domains.serialize(this.state), base)
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }

  /* Private ------------------------------------------------------ */

  _update(action) {
    let state =
      this._snapshots[this.history.before(action)] || this.getInitialState()

    if (this.parent) {
      state = merge(state, this.parent.state)
    }

    while (action) {
      state = this._domains.dispatch(action, state)

      this._snapshots[action] = state

      if (this.history.end(action)) {
        break
      }

      action = this.history.after(action)
    }
  }

  _updateSnapshotRange({ id, action, command }) {
    let payload = null

    action.subscribe({
      start: () => {
        this._update({ id, status: 'start', command, payload })
      },
      next: value => {
        payload = value
        this._update({ id, status: 'next', command, payload })
      },
      complete: () => {
        this._update({ id, status: 'complete', command, payload })
      },
      error: () => {
        payload = error
        this._update({ id, status: 'error', command, payload })
      }
    })
  }
}

Microcosm.version = version

export default Microcosm
