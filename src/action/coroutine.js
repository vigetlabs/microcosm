import promise from './middleware/promise'
import thunk   from './middleware/thunk'

export default function coroutine (action, body) {
  if (promise.condition(body)) {
    return promise.call(action, body)
  }

  if (thunk.condition(body)) {
    return thunk.call(action, body)
  }

  return action.close(body)
}
