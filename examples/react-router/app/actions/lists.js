import uid from 'uid'

export function addList(params) {
  return { id: uid(), ...params }
}

export function removeList(id) {
  return id
}
