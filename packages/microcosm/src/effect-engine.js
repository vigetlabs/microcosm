/**
 * @flow
 */

import getRegistration from './get-registration'
import { get, merge, result, createOrClone } from './utils'

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
    console.assert(
      !options || options.constructor === Object,
      'addEffect expected a plain object as the second argument. Instead got',
      get(options, 'constructor.name', 'Unknown')
    )

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
    let { command, payload, status } = action

    this.effects.forEach(effect => {
      let registry = result(effect, 'register')
      let handlers = getRegistration(registry, command, status)

      handlers.forEach(handler => handler.call(effect, this.repo, payload))
    })
  }
}

export default EffectEngine
