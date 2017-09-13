/**
 * Mutations
 * http://facebook.github.io/graphql/#sec-Mutation
 */

import { tag, set, merge } from 'microcosm'
import { reject } from './utilities'

function uid() {
  return Math.floor(Math.random() * 100000000).toString(16)
}

export function spawner(name) {
  return tag(args => merge({ id: uid() }, args), name)
}

export function passThrough(name) {
  return tag(n => n, name)
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

  return list.concat(record)
}
