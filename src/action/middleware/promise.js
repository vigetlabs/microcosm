import unpromise from  './promise/unpromise'
import isPromise from 'is-promise'

export default {

  condition(value) {
    return isPromise(value)
  },

  call(action, promise) {
    action.open()

    unpromise(promise, function (error, body) {
      if (error) {
        action.reject(error)
      } else {
        action.close(body)
      }
    })

    return action
  }

}
