/**
 * @flow
 */

import Subject from './subject'
import History from './history'
import DomainEngine from './domain-engine'
import EffectEngine from './effect-engine'
import installDevtools from './install-devtools'
import tag from './tag'
import { get, merge, clone } from './utils'
import { version } from '../package.json'
import { INITIAL_STATE, DESERIALIZE, SERIALIZE } from './lifecycle'
import { COMPLETE } from './status'
import { register } from './registry'

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
  domains: DomainEngine
  effects: EffectEngine

  _snapshots: Object

  constructor(preOptions?: ?Object) {
    super()

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})

    this.parent = this.options.parent
    this.history = this.parent ? this.parent.history : new History(this.options)

    this._snapshots = {}
    this.domains = new DomainEngine(this)
    this.effects = new EffectEngine(this)

    this.subscribe({
      start: () => this.setup(this.options),
      complete: () => this.teardown()
    })

    // A history is done reconciling and is ready for a release
    this.history.releases.subscribe(() => this.observer.next(this.state))
    this.history.updates.subscribe(next => this._updateSnapshotRange(next))

    if (this.options.debug) {
      installDevtools(this)
    }
  }

  get state(): Object {
    return this.recall(this.history.head)
  }

  recall(id) {
    if (id in this._snapshots) {
      return this._snapshots[id]
    }

    let state = this.getInitialState()

    this._snapshots[id] = state

    return state
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  getInitialState() {
    return this.domains.dispatch(
      {
        status: COMPLETE,
        command: INITIAL_STATE
      },
      {}
    )
  }

  push(command: any, ...params: *[]): Action {
    return this.history.append(command, params, this)
  }

  deserialize(payload: string | Object) {
    let base = payload

    if (typeof base === 'string') {
      base = JSON.parse(base)
    }

    if (this.parent) {
      base = merge(base, this.parent.deserialize(base))
    }

    let data = this.domains.dispatch(
      {
        status: COMPLETE,
        command: DESERIALIZE,
        payload: null
      },
      base
    )

    return clone(data)
  }

  toJSON() {
    let base = this.parent ? this.parent.toJSON() : null

    let json = this.domains.dispatch(
      {
        status: COMPLETE,
        command: SERIALIZE,
        payload: null
      },
      this.state
    )

    return merge(json, base)
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }

  addDomain() {
    return this.domains.add(...arguments)
  }

  addEffect() {
    return this.effects.add(...arguments)
  }

  /* Private ------------------------------------------------------ */

  _update(action) {
    let state = this.recall(this.history.before(action.id))

    while (action) {
      state = this.domains.dispatch(action, state)

      this._snapshots[action.id] = state

      if (this.history.end(action)) {
        break
      }

      action = this.history.after(action.id)
    }
  }

  _updateSnapshotRange(entry) {
    let action = register(entry)

    action.subscribe(revision => {
      this._update(revision)
      this.effects.dispatch(next)
    })
  }
}

Microcosm.version = version

export default Microcosm
