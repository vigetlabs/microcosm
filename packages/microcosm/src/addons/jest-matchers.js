/**
 * @flow weak
 */

import Microcosm, { get } from '../index'

declare var expect: any

expect.extend({
  toHaveStatus(action, status) {
    let operator = this.isNot ? 'not to' : 'to'
    let pass = action.status === status

    return {
      pass: pass,
      message: () => {
        return `Expected action ${operator} be '${status}'. Instead got ${
          action.status
        }.`
      }
    }
  },

  toHaveState(repo, key, value) {
    if (repo instanceof Microcosm === false) {
      throw new TypeError('toHaveState expects a Microcosm.')
    }

    let operator = this.isNot ? 'not to' : 'to'
    let pass = false
    let actual = get(repo.state, key)

    if (arguments.length > 2) {
      pass = JSON.stringify(actual) === JSON.stringify(value)
    } else {
      pass = actual !== undefined
    }

    // Display friendly key path
    let path = [].concat(key).join('.')

    return {
      pass: pass,
      message: () => {
        return (
          `Expected '${path}' in repo.state ${operator} be ${this.utils.printExpected(
            value
          )} ` + `but it is ${this.utils.printReceived(actual)}.`
        )
      }
    }
  }
})
