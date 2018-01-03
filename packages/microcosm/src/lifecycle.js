/**
 * @flow
 */

import { merge } from './data'
import { EMPTY_OBJECT } from './empty'

export const RESET = function $reset(data: Object, deserialize: boolean) {
  return (observer: observer, repo: *): void => {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    observer.complete(payload || EMPTY_OBJECT)
  }
}

export const PATCH = function $patch(data: Object, deserialize: boolean) {
  return (observer: observer, repo: *): void => {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    observer.complete(payload || EMPTY_OBJECT)
  }
}

export const SERIALIZE = '$serialize'

export const DESERIALIZE = '$deserialize'

export const INACTIVE = 'inactive'

export const START = 'start'

export const COMPLETE = 'complete'

export const NEXT = 'next'

export const ERROR = 'error'

export const UNSUBSCRIBE = 'unsubscribe'

export const DESERIALIZE_ACTION = {
  payload: null,
  meta: { status: COMPLETE, command: DESERIALIZE }
}

export const SERIALIZE_ACTION = {
  payload: null,
  meta: { status: COMPLETE, command: SERIALIZE }
}
