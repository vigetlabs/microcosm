/**
 * @flow
 */

import { type Subject } from './subject'
import { Registry } from './registry'
import { EMPTY_OBJECT } from './empty'
import { Agent } from './agent'

type EffectRegistry = {
  [any]: (repo: *, payload?: *) => *
}

export class Effect extends Agent {
  _registry: Registry

  constructor(repo: *, options?: Object) {
    super(repo, options)

    this._registry = new Registry(this)
  }

  /**
   * Returns an object mapping actions to methods on the effect. This is the
   * communication point between a effect and the rest of the system.
   */
  register(): EffectRegistry {
    return EMPTY_OBJECT
  }

  receive(action: Subject) {
    var handlers = this._registry.resolve(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(this, this.repo, action.payload)
    }
  }
}
