/**
 * Keep track of prior action states according to an action's id
 */

 import {
   BIRTH
 } from './lifecycle'

export default function Archive () {
  this.pool = {}
}

Archive.prototype = {
  get (action) {
    console.assert(action, 'Unable to get ' + action + ' action')
    return this.pool[action.id]
  },

  has (action) {
    return this.pool.hasOwnProperty(action.id)
  },

  set (action, state) {
    console.assert(action, 'Unable to set ' + action + ' action.')
    console.assert(action.command !== BIRTH, 'Birth action should never be set.')

    this.pool[action.id] = state
  },

  remove (action) {
    console.assert(action, 'Unable to remove ' + action + ' action.')
    console.assert(action.command !== BIRTH, 'Birth action should never be removed.')

    delete this.pool[action.id]
  }
}
