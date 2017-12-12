/**
 * @flow
 */

import tag from './tag'
import { merge } from './utils'

export const RESET = tag(function sandbox(data: Object, deserialize: boolean) {
  return (observer: observer, repo: *): void => {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    observer.next(merge(repo.getInitialState(), payload))
    observer.complete()
  }
}, '$reset')

export const PATCH = tag(function sandbox(data: Object, deserialize: boolean) {
  return (observer: observer, repo: *): void => {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    observer.next(payload || null)
    observer.complete()
  }
}, '$patch')

export const INITIAL_STATE = '$initialState'

export const SERIALIZE = '$serialize'

export const DESERIALIZE = '$deserialize'

export const INACTIVE = 'inactive'

export const START = 'start'

export const COMPLETE = 'complete'

export const NEXT = 'next'

export const ERROR = 'error'

export const CANCEL = 'cancel'

export const DESERIALIZE_ACTION = {
  payload: null,
  meta: { status: COMPLETE, command: DESERIALIZE }
}

export const SERIALIZE_ACTION = {
  payload: null,
  meta: { status: COMPLETE, command: SERIALIZE }
}

export const INITIAL_STATE_ACTION = {
  payload: null,
  meta: { status: COMPLETE, command: INITIAL_STATE }
}
