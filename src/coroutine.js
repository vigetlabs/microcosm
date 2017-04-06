import Action from './action'
import { isPromise, isGeneratorFn } from './utils'

/**
 * Coroutine is used by an action to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine (action, body, repo) {
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
    action.open()

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
    action.open()

    let iterator = body(repo.push.bind(repo), repo)

    function step (payload) {
      let next = iterator.next(payload)

      if (next.done) {
        action.resolve(payload)
      } else {
        progress(next.value)
      }
    }

    function progress (value) {
      if (value instanceof Action) {
        value.onDone(step)
        value.onCancel(action.cancel, action)
        value.onError(action.reject, action)
      } else {
        step(value)
      }
    }

    step()

    return action
  }

  /**
   * Check for thunks. An escape hatch to direction work with an
   * action. It is triggered by returning a function from a
   * command. This middleware will execute that function with the
   * action as the first argument.
   */
  if (typeof body === 'function') {
    body(action, repo)

    return action
  }

  // Otherwise just return a resolved action
  return action.resolve(body)
}
