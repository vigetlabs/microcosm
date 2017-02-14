import getRegistration from './get-registration'

function createHook (repo, effect) {

  return function ({ behavior, status, payload }) {
    let handler = getRegistration(effect, behavior, status)

    if (handler) {
      handler.call(effect, repo, payload)
    }
  }
}

export default function createEffect (repo, config, options) {
  let effect = null

  if (typeof config === 'function') {
    effect = new config(options, repo)
  } else {
    effect = Object.create(config)
  }

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
