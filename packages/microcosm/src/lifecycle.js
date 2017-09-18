/**
 * @flow
 */

import { mergeSame } from './utils'
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
    action.resolve(mergeSame(repo.state, payload))
  }
}

export const RESET = function $reset(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}

export const PATCH = function $patch(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}

export const BIRTH = tag('$birth')

export const START = tag('$start')

export const ADD_DOMAIN = tag('$addDomain')
