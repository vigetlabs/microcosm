import promise from './middleware/promise'
import thunk   from './middleware/thunk'

/**
 * Coroutine is used by an action to determine how it should resolve the
 * body of their associated behavior.
 *
 * @param {Action} action - The target action
 * @param {Any} body - The resulting value of the action's behavior
 * @return {Action} the provided action
 * @private
 */
export default function coroutine (action, body) {
  if (promise.condition(body)) {
    return promise.call(action, body)
  }

  if (thunk.condition(body)) {
    return thunk.call(action, body)
  }

  return action.close(body)
}
