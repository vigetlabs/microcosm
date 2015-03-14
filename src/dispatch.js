/**
 * Dispatch
 * Ensure a given value is a promise, then dispatch out when that
 * promise resolves.
 */

import promiseWrap from './promiseWrap'

export default function (dispatcher, type, result) {
  return promiseWrap(result).then(body => {
    dispatcher.dispatch({ type, body })
    return body
  })
}
