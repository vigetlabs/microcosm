import getRegistration from './get-registration'

import {
  createOrClone
} from './utils'

function createHook (repo, effect) {

  return function ({ behavior, status, payload }) {
    let handler = getRegistration(effect.register(), behavior, status)

    if (handler) {
      handler.call(effect, repo, payload)
    }
  }
}

export default function createEffect (repo, config, options) {
  let effect = createOrClone(config, options, repo)

  if (effect.setup) {
    effect.setup(repo, options)
  }

  if (effect.register) {
    repo.on('effect', createHook(repo, effect))
  }

  if (effect.teardown) {
    repo.on('teardown', effect.teardown, effect)
  }

  return effect
}
