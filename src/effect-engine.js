import getRegistration from './get-registration'
import { createOrClone } from './utils'

export default function EffectEngine (repo) {
  this.repo = repo
  this.effects = []
}

EffectEngine.prototype = {

  add (config, options) {
    let effect = createOrClone(config, options, this.repo)

    if (effect.setup) {
      effect.setup(this.repo, options)
    }

    this.effects.push(effect)

    return effect
  },

  teardown () {
    for (var i = 0, len = this.effects.length; i < len; i++) {
      var effect = this.effects[i]

      if (effect.teardown) {
        effect.teardown(this.repo)
      }
    }
  },

  dispatch (action) {
    let { command, payload, status } = action

    for (var i = 0, len = this.effects.length; i < len; i++) {
      var effect = this.effects[i]

      if (effect.register) {
        let handler = getRegistration(effect.register(), command, status)

        if (handler) {
          handler.call(effect, this.repo, payload)
        }
      }
    }
  }
}
