/**
 * Meta Domain
 * A domain for managing lifecycle methods and other default behavior
 * for other domains.
 */

import lifecycle from '../lifecycle'
import { merge } from '../utils'

export default function MetaDomain () {}

MetaDomain.prototype.setup = function (repo) {
  this.repo = repo
}

MetaDomain.prototype[lifecycle._willReset] = function (state, { owner, data }) {
  return owner === this.repo ? data : state
}

MetaDomain.prototype[lifecycle._willPatch] = function (state, { owner, data }) {
  if (owner !== this.repo) {
    return state
  }

  return merge(state, data)
}

MetaDomain.prototype[lifecycle._willRebase] = function (state, { owner, data }) {
  if (owner !== this.repo) {
    return state
  }

  return merge(data, state)
}
