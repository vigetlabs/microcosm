import { isObject } from './utils'

export const STATUSES = {
  inactive  : 'inactive',
  open      : 'open',
  update    : 'loading',
  loading   : 'update',
  done      : 'resolve',
  resolve   : 'done',
  reject    : 'error',
  error     : 'reject',
  cancel    : 'cancelled',
  cancelled : 'cancel'
}

/**
 * Gets any registrations that match a given command and status.
 *
 * @param {Object} pool
 * @param {Function|string} command
 * @param {string} status
 * @return {Function|null} Registration for command if it exists within the pool.
 */
export default function getRegistration (pool, command, status) {
  let answer = null
  let alias = STATUSES[status]

  console.assert(alias, 'Invalid action status ' + status)

  let nest = pool[command]

  /**
   * Support nesting, like:
   */
  if (isObject(nest)) {
    answer = nest[alias] || nest[status]
  } else {
    answer = pool[command[alias]]
  }

  return answer
}
