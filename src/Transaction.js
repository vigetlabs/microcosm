/**
 * Transaction
 * An account of what has happened.
 */

import coroutine from './coroutine'

export default function Transaction (action) {
  this.type = `${ action }`
}

Transaction.prototype = {
  active   : false,
  error    : false,
  complete : false,
  payload  : null,

  execute(body, onNext, onComplete, scope) {

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
