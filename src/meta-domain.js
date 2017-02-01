/**
 * Meta Domain
 * A domain for managing lifecycle methods and other default behavior
 * for other domains.
 */

import { merge } from './utils'

export default function MetaDomain () {
  this.reset = function (data, deserialize) {
    return function (action, repo) {
      let initial = repo.getInitialState()
      let payload = data

      if (deserialize) {
        try {
          payload = repo.deserialize(data)
        } catch (error) {
          action.reject(error)
        }
      }

      action.resolve(merge(initial, payload))
    }
  }

  this.patch = function (data, deserialize) {
    return function (action, repo) {
      let payload = data

      if (deserialize) {
        try {
          payload = merge(payload, repo.deserialize(payload))
        } catch (error) {
          action.reject(error)
        }
      }

      action.resolve(payload)
    }
  }

  this.rebase = function (data) {
    return data
  }
}

MetaDomain.prototype = {
  handleReset (state, data) {
    return data
  },

  handlePatch (state, data) {
    return merge(state, data)
  },

  handleRebase (state, data) {
    return merge(data, state)
  },

  register () {
    let registry = {}

    // TODO: This is to work around a parse issue with Buble
    registry[this.reset]  = this.handleReset
    registry[this.patch]  = this.handlePatch
    registry[this.rebase] = this.handleRebase

    return registry
  }
}
