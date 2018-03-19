// @flow
import { installDevtools } from './install-devtools'
import { History } from './history'
import { Subject } from './subject'
import { Domain } from './domain'
import { Effect } from './effect'
import { merge } from './data'
import { version } from '../package.json'

const DEFAULTS = {
  debug: false,
  parent: null
}

export class Microcosm extends Subject {
  history: History
  domains: { [string]: Domain<*> }
  options: Object

  static defaults: Object
  static version: string

  constructor(preOptions?: ?Object) {
    super()

    let options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})
    let parent = options.parent

    this.history = parent ? parent.history : new History(options)
    this.domains = parent ? Object.create(parent.domains) : {}
    this.options = options

    this.subscribe({
      complete: this.teardown.bind(this, this.options)
    })

    this.setup(this.options)

    if (options.debug) {
      installDevtools(this)
    }
  }

  get state(): Object {
    let value = {}

    for (let key in this.domains) {
      value[key] = this.domains[key].valueOf()
    }

    return value
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown(options?: Object) {
    // NOOP
  }

  addDomain(key: string, blueprint: *, config?: *): Domain<*> {
    console.assert(
      key in this.domains === false,
      'Can not add domain for "' + key + '". This state is already managed.'
    )

    console.assert(key && key.length > 0, 'Can not add domain to root level.')

    let options = merge(this.options, blueprint.defaults, { key }, config)
    let Entity = Domain.from(blueprint)
    let domain = new Entity(this, options)

    this.domains[key] = domain

    return domain
  }

  addEffect(blueprint: *, config?: *): Effect {
    let options = merge(this.options, blueprint.defaults, config)
    let Entity = Effect.from(blueprint)

    return new Entity(this, options)
  }

  push() {
    return this.history.append(this, ...arguments)
  }

  prepare() {
    return this.push.bind(this, ...arguments)
  }

  toJSON() {
    return merge({}, this.domains)
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }
}

Microcosm.version = version
