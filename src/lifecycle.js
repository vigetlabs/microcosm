/**
 * @flow
 */

import type Action from './action'
import type Microcosm from './microcosm'

function sandbox(data: Object, deserialize: boolean) {
  return (action: Action, repo: Microcosm): void => {
    let payload = data

    if (deserialize) {
      try {
        payload = repo.deserialize(data)
      } catch (error) {
        action.reject(error)
        throw error
      }
    }

    // Strip out keys not managed by this repo. This prevents children from
    // accidentally having their keys reset by parents.
    let sanitary = repo.domains.sanitize(payload)

    action.resolve(sanitary)
  }
}

export const RESET = function $reset(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}

export const PATCH = function $patch(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}

export const BIRTH = function $birth() {
  console.assert(
    false,
    'Birth lifecycle method should never be invoked directly.'
  )
}

export const START = function $start() {
  console.assert(
    false,
    'Start lifecycle method should never be invoked directly.'
  )
}

export const ADD_DOMAIN = function $addDomain(domain: Domain) {
  return domain
}
