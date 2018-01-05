/**
 * @flow
 */

import { EMPTY_OBJECT } from './empty'

function parse(data: Object, deserialize: boolean) {
  return function(action: Subject, repo: *) {
    let payload = data

    if (deserialize) {
      payload = repo.deserialize(data)
    }

    action.next(payload || EMPTY_OBJECT)
    action.complete()
  }
}

export const RESET = parse.bind(null)

export const PATCH = parse.bind(null)

export const SERIALIZE = '$serialize'

export const DESERIALIZE = '$deserialize'

export const INACTIVE = 'inactive'

export const START = 'start'

export const COMPLETE = 'complete'

export const NEXT = 'next'

export const ERROR = 'error'

export const UNSUBSCRIBE = 'unsubscribe'
