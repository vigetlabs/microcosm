/**
 * @flow
 */

import getRegistration from './get-registration'
import { merge, createOrClone } from './utils'

import type Action from './action'
import type Microcosm from './microcosm'

class EffectEngine {
  repo: Microcosm
  effects: Array<Effect>

  constructor(repo: Microcosm) {
    this.repo = repo
    this.effects = []
  }

  add(config: Object | Function, options?: Object) {
    let deepOptions = merge(this.repo.options, config.defaults, options)
    let effect: Effect = createOrClone(config, deepOptions, this.repo)

    if (effect.setup) {
      effect.setup(this.repo, deepOptions)
    }

    if (effect.teardown) {
      this.repo.on('teardown', effect.teardown, effect)
    }

    this.effects.push(effect)

    return effect
  }

  dispatch(action: Action) {
    let { command, payload, status } = action

    for (var i = 0; i < this.effects.length; i++) {
      var effect = this.effects[i]

      if (effect.register) {
        let handlers = getRegistration(effect.register(), command, status)

        for (var j = 0; j < handlers.length; j++) {
          handlers[j].call(effect, this.repo, payload)
        }
      }
    }
  }
}

export default EffectEngine
