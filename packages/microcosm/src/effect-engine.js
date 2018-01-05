/**
 * @flow
 */

import { spawn, map, setup, teardown } from './registry'
import { merge } from './data'

export function effectEngine(repo, entity, effectOptions) {
  let options = merge(repo.options, entity.defaults, effectOptions)
  let effect = spawn(entity, options, repo)
  let tracker = repo.history.updates.subscribe(map(repo, effect))

  repo.subscribe({
    start: setup(repo, effect, options),
    complete: teardown(repo, effect, options),
    unsubscribe: tracker.unsubscribe
  })

  return effect
}
