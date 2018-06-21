/**
 * @flow
 */

import assert from 'assert'
import { installDevtools } from './install-devtools'
import { Subject } from './subject'
import { Observable } from './observable'
import { Domain } from './domain'
import { Effect } from './effect'
import { merge } from './data'
import { inherit } from './proto'
import { RESET, PATCH } from './lifecycle'
import { coroutine } from './coroutine'
import { tag } from './tag'

const DEFAULTS = {
  debug: false,
  maxHistory: 1,
  parent: null
}

export class Microcosm extends Subject {
  dispatcher: Subject
  domains: { [string]: Subject }
  options: Object

  static defaults: Object

  constructor(preOptions?: ?Object) {
    super(null, { key: 'repo' })

    let options = merge(DEFAULTS, this.constructor.defaults, preOptions || {})
    let parent = options.parent

    this.domains = parent ? Object.create(parent.domains) : {}
    this.options = options
    this.dispatcher = parent ? parent.dispatcher : new Subject()

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

  addDomain(key: string, blueprint: *, options?: *): Subject {
    assert(
      key in this.domains === false,
      'Can not add domain for "' + key + '". This state is already managed.'
    )

    assert(key && key.length > 0, 'Can not add domain to root level.')

    assert(
      blueprint != null,
      `Unable to create domain using ` +
        `addDomain("${key}", ${String(blueprint)}). ` +
        `This often happens if you forget to add the second argument to ` +
        `addDomain, or if you imported the wrong namespace from a module.`
    )

    if (blueprint instanceof Observable) {
      this.domains[key] = Subject.from(blueprint)
      this.subscribe({ complete: this.domains[key].complete })
    } else {
      let Entity = inherit(blueprint, Domain)

      this.domains[key] = new Entity(this, merge({ key }, options))
    }

    return this.domains[key]
  }

  addEffect(blueprint: *, options?: *): Effect {
    assert(
      blueprint != null,
      `Unable to create effect using ` +
        `addEffect(${String(blueprint)}). ` +
        `This often happens if the wrong namespace from a ` +
        `module is passed into addEffect.`
    )

    let Entity = inherit(blueprint, Effect)

    return new Entity(this, options)
  }

  push(command, ...params) {
    let action = new Subject(undefined, {
      key: tag(command).toString(),
      origin: this
    })

    this.dispatcher.next(action)

    coroutine(action, command, params, this)

    return action
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

  reset(): Subject {
    console.warn(
      'repo.reset has been deprecated. Please use repo.push(reset, data)'
    )
    // $FlowFixMe - Push accepts variable arguments
    return this.push(RESET, ...arguments)
  }

  patch(): Subject {
    console.warn(
      'repo.patch has been deprecated. Please use repo.push(patch, data)'
    )
    // $FlowFixMe - Push accepts variable arguments
    return this.push(PATCH, ...arguments)
  }
}
