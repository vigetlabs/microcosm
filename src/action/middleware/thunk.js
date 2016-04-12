export default {

  condition(value) {
    return typeof value === 'function'
  },

  call(action, body) {
    return body(action)
  }

}
