/**
 * @flow
 */

import { map, setup, teardown } from './registry'
import { merge } from './data'

export function effectEngine(repo, entity, effectOptions) {
  let options = merge(repo.options, entity.defaults, effectOptions)
  let effect =
    typeof entity === 'function'
      ? new entity(options, repo)
      : Object.create(entity)

  repo.subscribe({
    start: setup(repo, effect, options),
    complete: teardown(repo, effect, options)
  })

  repo.history.updates.subscribe(map(repo, effect))

  return effect
}
