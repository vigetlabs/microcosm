/**
 * @flow
 */

import { type Microcosm } from '../src/microcosm'
import { type Subject } from './subject'
import { Registry } from './registry'
import { EMPTY_OBJECT } from './empty'
import { Agent } from './agent'

export class Effect extends Agent {
  _registry: Registry

  static defaults: ?Object

  constructor(repo: Microcosm, options: Object) {
    super(repo, options)
    this._registry = new Registry(this)
  }

  /**
   * Returns an object mapping actions to methods on the effect. This is the
   * communication point between a effect and the rest of the system.
   */
  register(): { [any]: (repo: Microcosm, payload?: *) => void } {
    return EMPTY_OBJECT
  }

  receive(action: Subject) {
    var handlers = this._registry.resolve(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(this, this.repo, action.payload)
    }
  }

  static from(config: *): Class<Effect> {
    if (typeof config === 'function') {
      return config
    }

    function NewEntity(repo: Microcosm, options?: Object) {
      // $FlowFixMe
      Effect.prototype.constructor.call(this, repo, options)
    }

    NewEntity.prototype = Object.create(Effect.prototype)

    for (var key in config) {
      NewEntity.prototype[key] = config[key]
    }

    // $FlowFixMe

    return NewEntity
  }
}
