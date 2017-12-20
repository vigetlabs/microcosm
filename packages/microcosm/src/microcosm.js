/**
 * @flow
 */

import History from './history'
import DomainEngine from './domain-engine'
import installDevtools from './install-devtools'
import { Subject } from './subject'
import { effectEngine } from './effect-engine'
import { clone, merge } from './data'
import { version } from '../package.json'
import { DESERIALIZE, SERIALIZE } from './lifecycle'

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
      start: this.setup.bind(this, this.options),
      complete: this.teardown.bind(this)
    })

    if (this.options.debug) {
      installDevtools(this)
    }
  }

  get state(): Object {
    // TODO: This is very inefficient!
    return merge(
      this.parent ? this.parent.state : null,
      this.domains.getInitialState(),
      this.history.current(this)
    )
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
      'Can not add domain for "' + key + '". This state is already managed.'
    )

    console.assert(key && key.length > 0, 'Can not add domain to root level.')

    return this.domains.add(this, key, config, options)
  }

  addEffect(config, options) {
    return effectEngine(this, config, options)
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
      this.domains.lifecycle(SERIALIZE, clone(this.state)),
      this.parent ? this.parent.toJSON() : null
    )
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }
}

Microcosm.version = version

export default Microcosm
