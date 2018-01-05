/**
 * @flow
 */

import History from './history'
import DomainEngine from './domain-engine'
import installDevtools from './install-devtools'
import { Subject } from './subject'
import { effectEngine } from './effect-engine'
import { clone, merge } from './data'
import { DESERIALIZE, SERIALIZE } from './lifecycle'
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
  domains: DomainEngine

  constructor(preOptions?: ?Object) {
    super('repo')

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})
    this.parent = this.options.parent
    this.history = this.parent ? this.parent.history : new History(this.options)
    this.domains = new DomainEngine(this)

    this.tracker = this.history.updates.subscribe(action => {
      this.domains.rollforward(this, action)
      this.next(this.state)
    })

    if (this.options.debug) {
      installDevtools(this)
    }

    this.setup(this.options)
  }

  get state(): Object {
    // TODO: This is very inefficient!
    return merge(
      this.parent ? this.parent.state : null,
      this.domains.getInitialState(),
      this.history.current(this)
    )
  }

  shutdown() {
    this.unsubscribe()
    this.tracker.unsubscribe()
    this.teardown()
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  addDomain(key, config, options) {
    console.assert(
      key in this.state === false,
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

  prepare(command: any, ...params: *[]): Action {
    return (...args) => this.push(command, ...params, ...args)
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
