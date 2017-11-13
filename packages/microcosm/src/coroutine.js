/*
 * @flow
 */

import Action from './action'
import { isFunction, isPromise, isGeneratorFn, isPlainObject } from './utils'

/**
 * Provide support for generators, performing a sequence of actions in
 * order.
 * @private
 */
type GeneratorAction = (repo: Microcosm) => Generator<Action, void, *>

function processGenerator(action: Action, body: GeneratorAction, repo: *) {
  action.open()

  let iterator = body(repo)

  function step(payload: mixed) {
    let next = iterator.next(payload)

    if (next.done) {
      action.resolve(payload)
    } else {
      progress(next.value)
    }
  }

  function progress(subAction: Action | Action[]): Action {
    if (Array.isArray(subAction) || isPlainObject(subAction)) {
      return progress(repo.parallel(subAction))
    }

    console.assert(
      subAction instanceof Action,
      `Iteration of generator expected an Action. Instead got ${typeof subAction}`
    )

    return subAction.subscribe(
      {
        onDone: step,
        onCancel: action.cancel,
        onError: action.reject
      },
      action
    )
  }

  step()

  return action
}

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine(action: Action, params: *[], repo: any) {
  let body = action.command.apply(null, params)

  /**
   * Provide support for Promises:
   *
   * 1. Open the action
   * 2. Unwrap the promise using `setTimeout`, which prevents errors
   *    elsewhere in the dispatch execution process from being trapped.
   * 3. If the promise is rejected, reject the action
   * 4. Otherwise resolve the action with the returned body
   */
  if (isPromise(body)) {
    action.open(...params)

    body.then(
      result => setTimeout(() => action.resolve(result), 0),
      error => setTimeout(() => action.reject(error), 0)
    )

    return action
  }

  /**
   * Provide support for generators, performing a sequence of actions
   * in order
   */
  if (isGeneratorFn(body)) {
    return processGenerator(action, body, repo)
  }

  /**
   * Check for thunks. An escape hatch to directly work with an
   * action. It is triggered by returning a function from a
   * command. This middleware will execute that function with the
   * action as the first argument. If the returned function is equal
   * to one of the action's params, assume it's a value to be returned
   * instead of a thunk.
   */
  if (isFunction(body) && !params.some(param => param === body)) {
    body(action, repo)

    return action
  }

  // Otherwise just return a resolved action
  return action.resolve(body)
}
