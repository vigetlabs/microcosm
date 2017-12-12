/*
 * @flow
 */

function asPromise(action, body) {
  body.then(action.complete, action.error)
}

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine(action, job, params: *[], repo: any): void {
  let body = job.apply(null, params)

  if (body && typeof body.then === 'function') {
    asPromise(action, body)
  } else if (typeof body === 'function' && params.indexOf(body) < 0) {
    body(action, repo)
  } else {
    // Otherwise just return a resolved action
    action.complete(body)
  }
}
