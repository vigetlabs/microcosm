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

    action.resolve({ repo, payload: payload || {} })
  }
}

export const RESET = tag(function $reset(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}, '$reset')

export const PATCH = tag(function $patch(data: Object, deserialize: boolean) {
  return sandbox(data, deserialize)
}, '$patch')

export const BIRTH = tag('$birth')

export const START = tag('$start')
