/**
 * This middleware provides an escape hatch to direction work with an
 * action. It is triggered by returning a function from a
 * behavior. This middleware will execute that function with the
 * action as the first argument.
 */
export default {

  condition(value) {
    return typeof value === 'function'
  },

  call(action, body) {
    return body(action)
  }

}
