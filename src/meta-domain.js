/**
 * @fileoverview Every Microcosm includes MetaDomain. It provides the
 * plumbing required for lifecycle methods like `reset` and `patch`.
 * @flow
 */

import { mergeSame, merge } from './utils'
import { RESET, PATCH, ADD_DOMAIN } from './lifecycle'

class MetaDomain {
  repo: Microcosm

  setup(repo: Microcosm) {
    this.repo = repo
  }

  /**
   * Build a new Microcosm state object.
   */
  reset(oldState: Object, newState: Object): Object {
    let filtered = mergeSame(oldState, newState)

    return merge(oldState, this.repo.getInitialState(), filtered)
  }

  /**
   * Merge a state object into the current Microcosm state.
   */
  patch(oldState: Object, newState: Object): Object {
    let filtered = mergeSame(oldState, newState)

    return merge(oldState, filtered)
  }

  /**
   * Update the initial state whenever a new domain is added to a
   * repo.
   */
  addDomain(oldState: Object): Object {
    return merge(this.repo.getInitialState(), oldState)
  }

  register() {
    // TODO: Flow does not like string coercion. How can we
    // get Flow type coverage on the register method?
    var registry = {
      [RESET.toString()]: this.reset,
      [PATCH.toString()]: this.patch,
      [ADD_DOMAIN.toString()]: this.addDomain
    }

    return registry
  }
}

export default MetaDomain
