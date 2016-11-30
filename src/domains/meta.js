/**
 * Meta Domain
 * A domain for managing lifecycle methods and other default behavior
 * for other domains.
 */

import lifecycle from '../lifecycle'
import merge from '../merge'

export default function MetaDomain () {}

MetaDomain.prototype = {

  setup (repo) {
    this.repo = repo
  },

  reset (state, { owner, data }) {
    return owner === this.repo ? data : state
  },

  patch (state, { owner, data }) {
    return owner === this.repo ? merge({}, state, data) : state
  },

  register() {
    return {
      [lifecycle._willReset]: this.reset,
      [lifecycle._willPatch]: this.patch
    }
  }

}
