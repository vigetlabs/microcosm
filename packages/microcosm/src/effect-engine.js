/**
 * @flow
 */

import { spawn, Cache } from './registry'
import { merge } from './data'

export function effectEngine(
  repo: Microcosm,
  entity: any,
  effectOptions: ?Object
) {
  let options = merge(repo.options, entity.defaults, effectOptions)
  let effect = spawn(entity, options, repo)
  let registry = new Cache(effect)

  let tracker = repo.history.subscribe(action => {
    if (registry.respondsTo(action) === false) {
      return null
    }

    let dispatcher = () => {
      let handlers = registry.resolve(action)

      for (var i = 0, len = handlers.length; i < len; i++) {
        handlers[i].call(effect, repo, action.payload)
      }
    }

    return action.subscribe({
      next: dispatcher,
      complete: dispatcher,
      error: dispatcher,
      cancel: dispatcher
    })
  })

  if (effect.setup) {
    effect.setup(repo, options)
  }

  repo.subscribe({
    complete() {
      tracker.unsubscribe()

      if (effect.teardown) {
        effect.teardown(repo, options)
      }
    }
  })

  return effect
}
