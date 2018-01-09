/**
 * @flow
 */

import { EMPTY_OBJECT } from './empty'

function parse(data: Object, deserialize: boolean) {
  if (deserialize && typeof data === 'string') {
    data = JSON.parse(data)
  }

  return { data: data || EMPTY_OBJECT, deserialize }
}

export const RESET = parse.bind(null)

export const PATCH = parse.bind(null)

export const INACTIVE = 'inactive'

export const START = 'start'

export const COMPLETE = 'complete'

export const NEXT = 'next'

export const ERROR = 'error'

export const UNSUBSCRIBE = 'unsubscribe'
