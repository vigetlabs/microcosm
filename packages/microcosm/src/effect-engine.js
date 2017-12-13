/**
 * @flow
 */

import { merge, createOrClone, isPlainObject } from './utils'
import { map, setup, teardown } from './registry'

export function effectEngine(repo, constructor, effectOptions) {
  let options = merge(repo.options, constructor.defaults, effectOptions)
  let effect: Effect = createOrClone(constructor, options, repo)

  repo.subscribe({
    start: setup(repo, effect, options),
    complete: teardown(repo, effect, options)
  })

  repo.history.updates.subscribe(map(repo, effect))

  return effect
}
