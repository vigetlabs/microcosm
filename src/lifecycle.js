/**
 * @flow
 */

import tag from './tag'

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

export const RESET = tag(function $reset(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}, '$reset')

export const PATCH = tag(function $patch(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}, '$patch')

export const BIRTH = tag(function $birth() {
  console.assert(
    false,
    'Birth lifecycle method should never be invoked directly.'
  )
}, '$birth')

export const START = tag(function $start() {
  console.assert(
    false,
    'Start lifecycle method should never be invoked directly.'
  )
}, '$start')

export const ADD_DOMAIN = tag(function $addDomain(domain: Domain) {
  return domain
}, '$addDomain')
