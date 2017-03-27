import getRegistration from './get-registration'
import { createOrClone } from './utils'

export default class EffectEngine {

  constructor (repo) {
    this._repo = repo
    this._effects = []
  }

  add (config, options) {
    let effect = createOrClone(config, options, this._repo)

    if (effect.setup) {
      effect.setup(this._repo, options)
    }

    this._effects.push(effect)

    return effect
  }

  teardown () {
    for (var i = 0, len = this._effects.length; i < len; i++) {
      var effect = this._effects[i]

      if (effect.teardown) {
        effect.teardown(this._repo)
      }
    }
  }

  dispatch (task) {
    let { command, payload, status } = task

    for (var i = 0, len = this._effects.length; i < len; i++) {
      var effect = this._effects[i]

      if (effect.register) {
        let handler = getRegistration(effect.register(), command, status)

        if (handler) {
          handler.call(effect, this._repo, payload)
        }
      }
    }
  }

}
