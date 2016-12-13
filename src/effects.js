import { merge } from './utils'

/**
 * A cluster of effects.
 */
export default function Effects (repo ) {
  this.repo = repo
  this.effects = []

  // Teardown all effects when the repo tears down
  this.repo.on('teardown', this.teardown, this)
}

Effects.prototype = {

  trigger (action) {
    for (var i = 0; i < this.effects.length; i++) {
      let effect = this.effects[i]

      if (effect.register == null) {
        continue
      }

      let handlers = effect.register()

      if (handlers[action.type]) {
        handlers[action.type].call(effect, this.repo, action.payload)
      }
    }
  },

  add (config, options) {
    let effect = null

    if (typeof config === 'function') {
      effect = new config(this.repo, options)
    } else {
      effect = merge({ repo: this.repo }, config)
    }

    this.effects.push(effect)

    if (typeof effect.setup === 'function') {
      effect.setup(this.repo, options)
    }

    return this
  },

  teardown () {
    for (var i = 0; i < this.effects.length; i++) {
      let effect = this.effects[i]

      if (typeof effect.teardown === 'function') {
        effect.teardown(this.repo)
      }
    }
  }

}
