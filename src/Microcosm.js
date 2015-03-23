/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat   from 'Heartbeat'
import promiseWrap from 'promiseWrap'

export default class Microcosm extends Heartbeat {

  constructor(seed) {
    super()

    this.stores = []
    this._state = this.getInitialState(seed)
  }

  getInitialState(seed={}) {
    return { ...seed }
  }

  set(key, value) {
    this._state = { ...this._state, [key]: value }
  }

  get(store) {
    return this._state[store] || store.getInitialState()
  }

  send(fn, params) {
    let request = promiseWrap(fn(params))

    return request.then(body => this.dispatch(fn, body))
  }

  dispatch(type, body) {
    this._state = this.stores.reduce((state, store) => {
      if (type in store) {
        state[store] = store[type](this.get(store), body)
      }
      return state
    }, { ...this._state })

    this.pump()

    return body
  }

  addStore(...store) {
    this.stores = this.stores.concat(store)
  }

  serialize() {
    return this.stores.reduce((memo, store) => {
      memo[store] = this.get(store)
      return memo
    }, {})
  }
}
