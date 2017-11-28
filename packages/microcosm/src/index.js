import Observable from 'zen-observable'
import History from './history'
import Microcosm from './microcosm'
import getRegistration from './get-registration'
import tag from './tag'
import { clone, merge, get, set, update, result } from './utils'
import { RESET, PATCH } from './lifecycle'

Observable.prototype.then = function(pass, fail) {
  return new Promise((resolve, reject) => {
    let last = null

    this.subscribe({
      next(value) {
        last = value
      },
      complete() {
        resolve(last)
      },
      error: reject
    })
  }).then(pass, fail)
}

export {
  Microcosm as default,
  Microcosm,
  History,
  tag,
  get,
  set,
  update,
  merge,
  clone,
  result,
  getRegistration,
  RESET as reset,
  PATCH as patch
}
