import { isObject } from './utils'
import { ACTION_ALIASES } from './constants'

const DONE = 'done'
export default function getRegistration (pool, behavior, status) {
  var alias = status ? ACTION_ALIASES[status] : DONE

  if (alias == null) {
    throw new ReferenceError('Invalid action status ' + status)
  }

  if (pool && behavior) {
    if (isObject(pool[behavior])) {
      return pool[behavior][alias] || pool[behavior][status]
    } else {
      return pool[behavior[alias]]
    }
  }

  return null
}
