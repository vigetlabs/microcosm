/**
 * @flow
 */

import { EMPTY_OBJECT } from './empty'
import { tag } from './tag'

function parse(data: Object, deserialize: boolean) {
  if (deserialize && typeof data === 'string') {
    data = JSON.parse(data)
  }

  return { data: data || EMPTY_OBJECT, deserialize: !!deserialize }
}

export const RESET = tag(parse.bind(null), '$reset')

export const PATCH = tag(parse.bind(null), '$patch')

export const START = 'start'

export const NEXT = 'next'

export const ERROR = 'error'

export const COMPLETE = 'complete'

export const CANCEL = 'cancel'

export const UNSUBSCRIBE = 'unsubscribe'
