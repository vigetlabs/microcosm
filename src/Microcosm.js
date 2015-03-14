/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from './heartbeat'
import intent    from './intent'
import prefix    from './prefix'
import transpose from './transpose'

import { Dispatcher } from 'flux'

export default class Microcosm {

  constructor(seed) {
    this._seed = seed || {}
    this._heart = Heartbeat()
    this._dispatcher = new Dispatcher()
    this._dispatcher.register(this._enqueue.bind(this))
  }

  get listen() {
    return this._heart.listen
  }

  get ignore() {
    return this._heart.ignore
  }

  _enqueue(payload) {
    for (let s in this.stores) {
      this.stores[s].send(payload)
    }
    this._heart.beat()
  }

  addActions(actions) {
    this.actions = transpose(actions, intent(this._dispatcher))
  }

  addStores(stores) {
    let constants = transpose(this.actions, prefix)

    this.stores = transpose(stores, (Store, id) => {
      return new Store(constants, this._seed[id], this)
    })
  }

  serialize() {
    return transpose(this.stores, store => store.serialize())
  }
}
