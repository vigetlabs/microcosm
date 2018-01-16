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
  _state: EMPTY_OBJECT,
  _domains: EMPTY_OBJECT,
  _answers: EMPTY_OBJECT
}

class Microcosm extends Subject {
  constructor(preOptions?: ?Object) {
    super()

    let options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})

    this.history = options._history || new History(options)
    this.state = options._state ? Object.create(options._state) : {}
    this.domains = options._domains ? Object.create(options._domains) : {}
    this.answers = options._answers ? Object.create(options._answers) : {}
    this.options = options

    if (options.debug) {
      installDevtools(this)
    }

    this.subscribe({
      start: this.setup.bind(this, this.options),
      cleanup: this.teardown.bind(this, this.options)
    })
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

    let { domain, answer } = domainEngine(this, key, config, options)

    this.domains[key] = domain
    this.answers[key] = answer

    Object.defineProperty(this.state, key, {
      enumerable: true,
      get: () => answer.payload
    })

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
        json[key] = this.domains[key].serialize(this.state[key])
      }
    }

    return json
  }

  fork() {
    return new Microcosm({
      _state: this.state,
      _domains: this.domains,
      _answers: this.answers,
      _history: this.history
    })
  }
}

Microcosm.version = version

export default Microcosm
