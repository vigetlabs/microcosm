import {
  RESET,
  PATCH
} from './lifecycle'

export default function MetaDomain (_, repo) {
  this.repo = repo
}

MetaDomain.prototype = {

  reset (state, data) {
    return this.patch(this.repo.getInitialState(), data)
  },

  patch (state, data) {
    return this.repo.realm.prune(state, data)
  },

  register () {
    return {
      [RESET] : this.reset,
      [PATCH] : this.patch
    }
  }

}
