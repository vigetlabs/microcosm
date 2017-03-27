import { isPromise } from './utils'

/**
 * Coroutine is used by a task to determine how it should resolve
 * the body of their associated command.
 */
export default function coroutine (task, body, repo) {
  /**
   * Provide support for Promises:
   *
   * 1. Open the task
   * 2. Unwrap the promise using `setTimeout`, which prevents errors
   *    elsewhere in the dispatch execution process from being trapped.
   * 3. If the promise is rejected, reject the task
   * 4. Otherwise resolve the task with the returned body
   */
  if (isPromise(body)) {
    task.open()

    body.then(
      result => global.setTimeout(() => task.resolve(result), 0),
      error  => global.setTimeout(() => task.reject(error), 0)
    )

    return task
  }

  /**
   * Check for thunks. An escape hatch to direction work with an
   * task. It is triggered by returning a function from a
   * command. This middleware will execute that function with the
   * task as the first argument.
   */
  if (typeof body === 'function') {
    body(task, repo)

    return task
  }

  // Otherwise just return a resolved task
  return task.resolve(body)
}
