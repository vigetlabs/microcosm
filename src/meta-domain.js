import { merge } from './utils'

import { RESET, PATCH, ADD_DOMAIN } from './lifecycle'

export default function MetaDomain(_, repo) {
  this.repo = repo
}

MetaDomain.prototype = {
  reset(state, data) {
    let filtered = this.repo.domains.sanitize(data)

    return merge(state, this.repo.getInitialState(), filtered)
  },

  patch(state, data) {
    let filtered = this.repo.domains.sanitize(data)

    return merge(state, filtered)
  },

  addDomain(state) {
    return merge(this.repo.getInitialState(), state)
  },

  register() {
    return {
      [RESET]: this.reset,
      [PATCH]: this.patch,
      [ADD_DOMAIN]: this.addDomain
    }
  }
}
