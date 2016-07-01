import uid from 'uid'

export function addItem (params) {
  return { id: uid(), ...params }
}

export function removeItem (id) {
  return id
}
