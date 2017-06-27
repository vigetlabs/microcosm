// @flow
import uid from 'uid'

export function addList(params: Object) {
  return { id: uid(), ...params, foo: 'bar' }
}

export function removeList(id: number) {
  return id
}
