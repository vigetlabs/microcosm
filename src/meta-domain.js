import { merge } from './utils'
import { RESET, PATCH, ADD_DOMAIN } from './lifecycle'

/**
 * @fileoverview Every Microcosm includes MetaDomain. It provides the
 * plumbing required for lifecycle methods like `reset` and `patch`.
 */
class MetaDomain {
  setup(repo) {
    this.repo = repo
  }

  /**
   * Build a new Microcosm state object.
   * @param {Object} oldState
   * @param {Object} newState
   */
  reset(oldState, newState) {
    let filtered = this.repo.domains.sanitize(newState)

    return merge(oldState, this.repo.getInitialState(), filtered)
  }

  /**
   * Merge a state object into the current Microcosm state.
   * @param {Object} oldState
   * @param {Object} newState
   */
  patch(oldState, newState) {
    let filtered = this.repo.domains.sanitize(newState)

    return merge(oldState, filtered)
  }

  /**
   * Update the initial state whenever a new domain is added to a
   * repo.
   * @param {Object} oldState
   */
  addDomain(oldState) {
    return merge(this.repo.getInitialState(), oldState)
  }

  register() {
    return {
      [RESET]: this.reset,
      [PATCH]: this.patch,
      [ADD_DOMAIN]: this.addDomain
    }
  }
}

export default MetaDomain
