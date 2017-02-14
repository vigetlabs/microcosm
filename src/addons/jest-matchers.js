import { tag, getRegistration } from '../microcosm'

expect.extend({

  toRegister (entity, behavior, status = 'done') {
    let tagged = tag(behavior)
    let name = behavior.name || tagged.toString()

    let operator = this.isNot ? 'not to' : 'to'
    let pass = getRegistration(entity, behavior, status) != null

    return {
      pass: pass,
      message: () => {
        return `Expected entity ${operator} register to the "${status}" state of ${name}.`
      }
    }
  },

  toHaveStatus (action, status) {
    let operator = this.isNot ? 'not to' : 'to'
    let pass = action.is(status)

    return {
      pass: pass,
      message: () => {
        return `Expected action ${operator} to be"${status}".`
      }
    }
  }

})
