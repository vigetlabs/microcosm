// @flow
import { isObject } from './utils'

function isPlainObject(value) {
  return !Array.isArray(value) && isObject(value)
}

/**
 * Gets any registrations that match a given command and status.
 */
function getRegistration(pool: any, command: Tagged, status: Status) {
  let answer = []

  if (pool == null) {
    return answer
  }

  console.assert(
    command.__tagged,
    `Unable to register ${command.name || 'action'}(). It has not been tagged.`
  )

  let nest = pool[command]
  let type = command[status] || ''

  /**
   * Support nesting, like:
   */
  if (isPlainObject(nest)) {
    answer = nest[status]

    /**
     * Throw in strict mode if a nested registration is undefined. This is usually a typo.
     */
    console.assert(
      !(status in nest) || answer !== undefined,
      `The "${status}" key within a nested registration for ${command.name ||
        'an action'} is ${answer}. Is it being referenced correctly?`
    )
  } else {
    answer = pool[type]

    /**
     * Similarly, throw in strict mode if a regular registration is undefined. This is usually a typo.
     */
    console.assert(
      !(type in pool) || answer !== undefined,
      `${command.toString()} key within a registration is ${
        answer
      }. Is it being referenced correctly?`
    )
  }

  if (answer) {
    return Array.isArray(answer) ? answer : [answer]
  }

  return []
}

export default getRegistration
