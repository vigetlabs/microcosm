/**
 * A cluster of effects.
 */

import merge from './merge'

const EMPTY = {}

export default class Effects {

  constructor(repo) {
    this.repo = repo
    this.effects = []
  }

  trigger (action) {
    for (var i = 0; i < this.effects.length; i++) {
      let effect = this.effects[i]
      let handlers = effect.register ? effect.register() : EMPTY

      if (handlers[action.type]) {
        handlers[action.type].call(effect, this.repo, action.payload)
      }
    }
  }

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
  }

  teardown () {
    for (var i = 0; i < this.effects.length; i++) {
      let effect = this.effects[i]

      if (typeof effect.teardown === 'function') {
        effect.teardown(this.repo)
      }
    }
  }

}
