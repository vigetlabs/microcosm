/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from 'Heartbeat'
import isEqual   from 'is-equal-shallow'

export default class Microcosm extends Heartbeat {

  constructor() {
    super()

    this._stores = []
    this._state  = this.getInitialState()
  }

  shouldUpdate(prev, next) {
    return isEqual(prev, next) == false
  }

  getInitialState() {
    return {}
  }

  seed(data) {
    let insert = this._stores.filter(i => data[i])

    insert.forEach(function(store) {
      this.set(store, store.getInitialState(data[store]))
    }, this)
  }

  set(key, value) {
    this._state = { ...this._state, [key]: value }
  }

  has(store) {
    return this._stores.indexOf(store) > -1
  }

  get(store, seed) {
    return this._state[store] || store.getInitialState(seed)
  }

  send(fn, ...params) {
    // Allow currying of send method for cleaner callbacks
    if (params.length < fn.length) {
      return this.send.bind(this, fn)
    }

    let request = fn(...params)

    if (request instanceof Promise) {
      return request.then(body => this.dispatch(fn, body))
    }

    return this.dispatch(fn, request)
  }

  dispatch(type, body) {
    let next = this._stores.reduce((state, store) => {
      if (type in store) {
        state[store] = store[type](this.get(store), body)
      }
      return state
    }, { ...this._state })

    if (this.shouldUpdate(this._state, next)) {
      this._state = next
      this.pump()
    }

    return body
  }

  addStore(...store) {
    this._stores = this._stores.concat(store)
  }

  toJSON() {
    return this.serialize()
  }

  serialize() {
    return this._stores.reduce((memo, store) => {
      memo[store] = this.get(store)
      return memo
    }, {})
  }
}
