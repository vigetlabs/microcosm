/**
 * @fileoverview A general modelling class used by the Presenter's
 * getModel function.
 */

import { merge } from '../microcosm'

function compute(binding, scope, repo) {
  if (binding && typeof binding.call === 'function') {
    return binding.call(scope, repo.state, repo)
  }

  return binding
}

export default class Model {
  constructor(bindings, repo, scope) {
    this.repo = repo
    this.scope = scope
    this.bindings = bindings
    this.value = {}

    this.update()
  }

  update() {
    let last = this.value
    let next = null

    for (var key in this.bindings) {
      var value = compute(this.bindings[key], this.scope, this.repo)

      if (last[key] !== value) {
        next = next || {}
        next[key] = value
      }
    }

    this.value = merge(last, next)

    return next
  }
}
