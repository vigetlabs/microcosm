import {
  merge
} from './utils'

import {
  RESET,
  PATCH,
  ADD_DOMAIN
} from './lifecycle'

export default class MetaDomain {

  constructor (_, repo) {
    this.repo = repo
  }

  reset (state, data) {
    let filtered = this.repo.domains.sanitize(data)

    return merge(state, this.repo.getInitialState(), filtered)
  }

  patch (state, data) {
    let filtered = this.repo.domains.sanitize(data)

    return merge(state, filtered)
  }

  addDomain (state) {
    return merge(this.repo.getInitialState(), state)
  }

  register () {
    let events = {
      [RESET] : this.reset,
      [PATCH] : this.patch,
      [ADD_DOMAIN]: this.addDomain
    }

    return events
  }

}
