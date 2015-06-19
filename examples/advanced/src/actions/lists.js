import uid from 'uid'

function add(params) {
  return Object.assign({ id: uid() }, params)
}

function remove(id) {
  return id
}

export default { add, remove }
