/*
 * @flow
 */

import { Observable } from './observable'
import { getSymbol } from './symbols'

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine(action, job, params: *[], repo: any): void {
  if (typeof job !== 'function') {
    action.next(params.length ? params[0] : undefined)
    action.complete()
    return
  }

  if (isGeneratorFn(job)) {
    return asGenerator(action, job(repo, ...params))
  }

  let body = job.apply(null, params)

  if (isGeneratorFn(body)) {
    asGenerator(action, body(repo, action))
  } else if (typeof body === 'function' && params.indexOf(body) < 0) {
    body(action, repo)
  } else {
    action.subscribe(Observable.wrap(body).subscribe(action))
  }
}

function isGeneratorFn(value: any): boolean {
  return value && value[getSymbol('toStringTag')] === 'GeneratorFunction'
}

function asGenerator(action: Subject, iterator: GeneratorAction) {
  function step() {
    let next = iterator.next(action.payload)

    if (next.done) {
      action.complete()
    } else {
      let subject = Observable.hash(next.value)

      let tracker = subject.subscribe({
        next: action.next,
        complete: step,
        error: action.error,
        cancel: action.cancel
      })

      action.subscribe({ cancel: tracker.unsubscribe })
    }
  }

  step()
}
