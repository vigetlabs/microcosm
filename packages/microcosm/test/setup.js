import { get, scheduler } from 'microcosm'
import expect from 'expect'

scheduler().onError(error => {
  throw error instanceof Error ? error : new Error(error)
})

// Make a strict-only test flag
it.dev = function(description, test) {
  if (!process.env.BUNDLED) {
    return it(description, test)
  }

  return it.skip(description, test)
}

describe.dev = function(description, suite) {
  if (!process.env.BUNDLED) {
    return describe(description, test)
  }

  return describe.skip(description, test)
}

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
