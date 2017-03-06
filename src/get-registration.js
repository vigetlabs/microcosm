import { isObject } from './utils'
import { ACTION_ALIASES } from './constants'

const DONE = 'done'
export default function getRegistration (pool, command, status) {
  let answer = null
  let alias = status ? ACTION_ALIASES[status] : DONE

  if (alias == null) {
    throw new ReferenceError('Invalid action status ' + status)
  }

  if (pool && command) {
    if (isObject(pool[command])) {
      answer = pool[command][alias] || pool[command][status]
    } else {
      answer = pool[command[alias]]
    }
  }

  return answer
}
