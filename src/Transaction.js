/**
 * Transaction
 * An account of what has happened.
 */

import coroutine  from './coroutine'
import flatten    from './flatten'
import eventually from './eventually'

export default function Transaction (action, payload) {
  this.action  = action
  this.type    = `${ action }`
  this.active  = arguments.length > 1
  this.payload = payload
}

Transaction.prototype = {
  action   : null,
  active   : false,
  error    : false,
  payload  : undefined,
  complete : false,

  execute(params, onNext, onComplete, scope) {
    let body = this.action.apply(null, flatten(params))

    return coroutine(body, (error, payload, done) => {
      this.active   = !error
      this.error    = !!error
      this.payload  = error ? error : payload
      this.complete = done

      onNext.call(scope, this)

      if (done) {
        eventually(onComplete, scope, error, payload)
      }
    })
  }
}
