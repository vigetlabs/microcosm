/**
 * Mutations
 * http://facebook.github.io/graphql/#sec-Mutation
 */

import { set, merge } from 'microcosm'
import { reject } from './utilities'

let count = 0
function uid(prefix) {
  return `${prefix}-${count++}`
}

export function record(name) {
  return args => merge({ id: uid(name) }, args)
}

export function passThrough(name) {
  return n => n
}

export function append(list, item) {
  return list.concat(item)
}

export function remove(list, args) {
  return reject(list, args)
}

export function update(list, record) {
  for (var i = 0, len = list.length; i < len; i++) {
    if (list[i].id === record.id) {
      return set(list, [i], merge(list[i], record))
    }
  }

  return append(list, record)
}
