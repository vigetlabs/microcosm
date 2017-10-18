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

    action.resolve(payload || {})
  }
}

export const RESET = tag(sandbox.bind(null), '$reset')

export const PATCH = tag(sandbox.bind(null), '$patch')

export const START = tag('$start')
