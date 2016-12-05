/**
 * In order to test warnings, record console output.
 */

const util = require('util')

const originals = {}
const messages = {
  log: [],
  warn: [],
  error: []
}

export default {

  record() {
    for (let key in messages) {
      originals[key] = console[key]
      console[key] = (...args) => messages[key].push(args)
    }
  },

  last(key) {
    return util.format.apply(util, messages[key].concat().pop())
  },

  count(key) {
    if (key in messages === false) {
      throw new Error(`console.${key} is not tracked. Please add it to "${ __filename }."`)
    }

    return messages[key].length
  },

  restore() {
    for (let key in messages) {
      console[key] = originals[key]
      messages[key].length = 0
    }
  }

}
