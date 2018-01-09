// @flow
import History from './history'
import DomainEngine from './domain-engine'
import installDevtools from './install-devtools'
import { Observable } from './observable'
import { Subject } from './subject'
import { effectEngine } from './effect-engine'
import { merge } from './data'
import { DESERIALIZE, SERIALIZE } from './lifecycle'
import { version } from '../package.json'

const DEFAULTS = {
  debug: false,
  parent: null
}

const reducer = (a, b) => b(a)

class Microcosm extends Subject {
  constructor(preOptions?: ?Object) {
    super('repo')

    this.options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})
    this.parent = this.options.parent
    this.history = this.parent ? this.parent.history : new History(this.options)
    this.domains = new DomainEngine()

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
    this.complete()
    this.tracker.unsubscribe()
    this.teardown()
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  watch(key, ...callbacks) {
    let updater = state => callbacks.reduce(reducer, state[key])

    return new Observable(observer => {
      observer.next(updater(this.state))
      return this.map(updater).subscribe(observer)
    })
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

  push(command: any, ...params: *[]): Subject {
    return this.history.append(command, params, this)
  }

  prepare(): Subject {
    return this.push.bind(this, ...arguments)
  }

  toJSON() {
    return merge(
      this.parent ? this.parent.toJSON() : null,
      this.domains.serialize(this.state)
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
