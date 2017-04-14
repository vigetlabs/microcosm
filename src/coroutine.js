import Action from './action'
import { isFunction, isPromise, isGeneratorFn } from './utils'

/**
 * Provide support for generators, performing a sequence of actions in
 * order.
 */
function processGenerator (action, body, repo) {
  action.open()

  let iterator = body(repo)

  function step (payload) {
    let next = iterator.next(payload)

    if (next.done) {
      action.resolve(payload)
    } else {
      progress(next.value)
    }
  }

  function progress (subAction) {
    console.assert(subAction instanceof Action,
                   `Iteration of generator expected an Action. Instead got ${subAction}`)

    subAction.onDone(step)
    subAction.onCancel(action.cancel, action)
    subAction.onError(action.reject, action)
  }

  step()

  return action
}

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine (action, command, params, repo) {
  let body = command.apply(action, params)

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
      result => global.setTimeout(() => action.resolve(result), 0),
      error  => global.setTimeout(() => action.reject(error), 0)
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
   * Check for thunks. An escape hatch to direction work with an
   * action. It is triggered by returning a function from a
   * command. This middleware will execute that function with the
   * action as the first argument.
   */
  if (isFunction(body)) {
    body(action, repo)

    return action
  }

  // Otherwise just return a resolved action
  return action.resolve(body)
}
