// @flow
import History from './history'
import installDevtools from './install-devtools'
import { Subject } from './subject'
import { effectEngine } from './effect-engine'
import { domainEngine } from './domain-engine'
import { merge } from './data'
import { version } from '../package.json'
import { EMPTY_OBJECT } from './empty'

const DEFAULTS = {
  debug: false,
  parent: null
}

class Microcosm extends Subject {
  constructor(preOptions?: ?Object) {
    super()

    let options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})
    let parent = options.parent

    this.history = parent ? parent.history : new History(options)
    this.domains = parent ? Object.create(parent.domains) : {}
    this.answers = parent ? Object.create(parent.answers) : {}
    this.options = options

    this.subscribe({
      start: this.setup.bind(this, this.options),
      cleanup: this.teardown.bind(this, this.options)
    })

    if (options.debug) {
      installDevtools(this)
    }
  }

  get state() {
    let value = {}

    for (let key in this.answers) {
      value[key] = this.answers[key].payload
    }

    return value
  }

  setup(options?: Object) {
    // NOOP
  }

  teardown() {
    // NOOP
  }

  addDomain(key, config, options) {
    console.assert(
      key in this.domains === false,
      'Can not add domain for "' + key + '". This state is already managed.'
    )

    console.assert(key && key.length > 0, 'Can not add domain to root level.')

    let { domain, answer } = domainEngine(this, key, config, options)

    this.domains[key] = domain
    this.answers[key] = answer

    return domain
  }

  addEffect(config, options) {
    return effectEngine(this, config, options)
  }

  push() {
    return this.history.append(this, ...arguments)
  }

  prepare() {
    return this.push.bind(this, ...arguments)
  }

  toJSON() {
    let json = {}

    for (var key in this.domains) {
      if (this.domains[key].serialize) {
        json[key] = this.domains[key].serialize(this.answers[key].payload)
      }
    }

    return json
  }

  fork() {
    return new Microcosm({
      parent: this
    })
  }
}

Microcosm.version = version

export default Microcosm
