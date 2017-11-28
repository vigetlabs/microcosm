/**
 * @flow
 */

import tag from './tag'

function sandbox(data: Object, deserialize: boolean) {
  return (observer: observer, repo: *): void => {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    observer.next(payload || {})
    observer.complete()
  }
}

export const RESET = tag(sandbox.bind(null), '$reset')

export const PATCH = tag(sandbox.bind(null), '$patch')

export const INITIAL_STATE = tag('$initialState')

export const SERIALIZE = tag('$serialize')

export const DESERIALIZE = tag('$deserialize')
