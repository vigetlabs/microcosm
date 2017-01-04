function createHook (repo, effect) {

  return function (action) {
    let handler = effect.register()[action.type]

    if (handler) {
      handler.call(effect, repo, action.payload)
    }
  }
}

export default function createEffect (repo, config, options) {
  let effect = null

  if (typeof config === 'function') {
    effect = new config(repo, options)
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
}
