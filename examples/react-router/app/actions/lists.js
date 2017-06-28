// @flow
import uid from 'uid'

export function addList(params: Object) {
  return { id: uid(), ...params }
}

export function removeList(id: number) {
  return id
}
