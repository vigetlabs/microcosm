/**
 * @flow
 */

import getRegistration from './get-registration'
import { merge, result, createOrClone } from './utils'

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

    this.repo.subscribe({
      start: () => {
        if (effect.setup) {
          effect.setup(this.repo, deepOptions)
        }
      },
      complete: () => {
        if (effect.teardown) {
          effect.teardown(this.repo)
        }
      }
    })

    this.effects.push(effect)

    return effect
  }

  dispatch(action: Action) {
    this.effects.forEach(effect => {
      getRegistration(result(effect, 'register'), action).forEach(handler =>
        handler.call(effect, this.repo, action.payload)
      )
    })
  }
}

export default EffectEngine
