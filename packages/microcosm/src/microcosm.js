/**
 * @flow
 */

import { Subject } from './subject'
import History from './history'
import DomainEngine from './domain-engine'
import installDevtools from './install-devtools'
import { effectEngine } from './effect-engine'
import { merge } from './utils'
import { version } from '../package.json'
import { INITIAL_STATE, DESERIALIZE, SERIALIZE } from './lifecycle'

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

  constructor(preOptions?: ?Object) {
    super()

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})

    this.parent = this.options.parent
    this.history = this.parent ? this.parent.history : new History(this.options)

    this.domains = new DomainEngine(this)

    this.subscribe({
      start: () => this.setup(this.options),
      complete: () => this.teardown()
    })

    // A history is done reconciling and is ready for a release
    this.history.updates.subscribe(next => {
      this._update(next)
    })

    if (this.options.debug) {
      installDevtools(this)
    }
  }

  get state(): Object {
    return this.history.current(this) || this.getInitialState()
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  addDomain(key, config, options) {
    console.assert(
      this.state.hasOwnProperty(key) === false,
      'Can not add domain for ' + key + '. This state is already managed.'
    )

    return this.domains.add(key, config, options)
  }

  addEffect(config, options) {
    return effectEngine(this, config, options)
  }

  getInitialState() {
    return this.domains.lifecycle(INITIAL_STATE, {})
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

    return this.domains.lifecycle(DESERIALIZE, base)
  }

  toJSON() {
    return merge(
      this.domains.lifecycle(SERIALIZE, this.state),
      this.parent ? this.parent.toJSON() : null
    )
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }

  /* Private ------------------------------------------------------ */

  _update(action) {
    let state = this.history.recall(action, this) || this.getInitialState()

    while (action) {
      this.history.stash(action, this, this.domains.dispatch(action, state))
      action = this.history.after(action)
    }
  }
}

Microcosm.version = version

export default Microcosm
