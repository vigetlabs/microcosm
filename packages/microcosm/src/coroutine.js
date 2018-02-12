/**
 * @flow
 */

import { Microcosm } from './microcosm'
import { Observable } from './observable'
import { type Subject } from './subject'
import { toStringTag } from './symbols'

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export function coroutine(
  action: Subject,
  job: any,
  params: any[],
  repo: Microcosm
): void {
  if (typeof job !== 'function') {
    action.next(params.length ? params[0] : undefined)
    action.complete()
    return
  }

  if (isGeneratorFn(job)) {
    return asGenerator(action, job(repo, ...params), repo)
  }

  let body = job.apply(null, params)

  if (isGeneratorFn(body)) {
    asGenerator(action, body(repo, action), repo)
  } else if (typeof body === 'function' && params.indexOf(body) < 0) {
    body(action, repo)
  } else {
    action.subscribe(Observable.wrap(body).subscribe(action))
  }
}

function isGeneratorFn(value: any): boolean {
  return value && value[toStringTag] === 'GeneratorFunction'
}

function asGenerator(action: Subject, iterator: Iterator<*>, repo) {
  function step() {
    let next = iterator.next(action.payload)
    let value = next.value

    if (next.done) {
      action.complete()
    } else {
      let subject = Observable.hash(value)

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
