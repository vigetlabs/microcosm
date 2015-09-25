import uid from 'uid'

function add(list, params) {
  return Object.assign({ id: uid(), list }, params)
}

function remove(id) {
  return id
}

export default { add, remove }
