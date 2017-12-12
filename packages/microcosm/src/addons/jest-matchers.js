/**
 * @flow weak
 */

import Microcosm, { Action, tag, get, result, getHandlers } from '../index'

declare var expect: any

expect.extend({
  toRegister(entity, command, status = 'complete') {
    let tagged = tag(command)
    let name = tagged.toString()

    if (entity.register == null) {
      throw new TypeError(`${entity.constructor.name} has no register method.`)
    }

    let operator = this.isNot ? 'not to' : 'to'
    let registry = result(entity, 'register')
    let action = { meta: { status, command }, payload: null }

    return {
      pass: getHandlers(registry, action).length > 0,
      message: () => {
        return `Expected entity ${operator} register to the '${status}' state of ${name}.`
      }
    }
  },

  toHaveStatus(action, status) {
    if (action instanceof Action === false) {
      throw new TypeError('toHaveStatus expects an action.')
    }

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
