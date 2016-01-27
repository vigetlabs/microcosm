import uid from 'uid'

export function addItem (list, params) {
  return { id: uid(), list, ...params }
}

export function removeItem (id) {
  return id
}
