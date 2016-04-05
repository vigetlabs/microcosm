/**
 * Transaction
 * An account of what has happened.
 */

import coroutine from './coroutine'
import flatten   from './flatten'

const identity = n => n

export default function Transaction (action, payload) {
  this.type    = `${ action }`
  this.action  = typeof action === 'function' ? action : identity
  this.active  = arguments.length > 1
  this.payload = payload
}

Transaction.prototype = {
  active   : false,
  error    : false,
  complete : false,

  execute(params, onNext, onComplete, scope) {
    let body = this.action.apply(null, flatten(params))

    return coroutine(body, (error, payload, done) => {
      this.active   = !error
      this.error    = !!error
      this.payload  = error ? error : payload
      this.complete = done

      onNext.call(scope, this)

      if (done && onComplete) {
        onComplete.call(scope, error, payload)
      }

      return payload
    })
  }
}
