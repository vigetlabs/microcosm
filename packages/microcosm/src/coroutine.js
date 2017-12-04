/*
 * @flow
 */

import { isFunction, isPromise } from './utils'

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine(action, job, params: *[], repo: any): void {
  let body = job.apply(null, params)

  if (isPromise(body)) {
    body.then(
      payload => {
        action.next(payload)
        action.complete(payload)
      },
      payload => action.error(payload)
    )

    return
  }

  if (isFunction(body) && !params.some(param => param === body)) {
    body(action, repo)
    return
  }

  // Otherwise just return a resolved action
  action.next(body)
  action.complete()

  return
}
