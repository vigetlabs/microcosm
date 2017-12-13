/*
 * @flow
 */

import { Observable, fromIterator } from './observable'
import { getSymbol, isPlainObject, observerHash } from './utils'

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine(action, job, params: *[], repo: any): void {
  let body = job.apply(null, params)

  if (isGeneratorFn(body)) {
    asGenerator(action, body, repo)
  } else if (body && typeof body.then === 'function') {
    asPromise(action, body)
  } else if (typeof body === 'function' && params.indexOf(body) < 0) {
    body(action, repo)
  } else {
    action.complete(body)
  }
}

function isGeneratorFn(value: any): boolean {
  return value && value[getSymbol('toStringTag')] === 'GeneratorFunction'
}

function asGenerator(action: Action, body: GeneratorAction, repo: *) {
  let iterator = body(repo)

  function step(payload: mixed) {
    let next = iterator.next(payload)

    if (next.done) {
      action.complete(payload)
    } else {
      observerHash(next.value).subscribe({
        error: action.error,
        complete: step
      })
    }
  }

  step()
}

function asPromise(action, body) {
  return body.then(action.complete, action.error)
}
