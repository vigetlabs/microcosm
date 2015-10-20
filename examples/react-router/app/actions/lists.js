import uid from 'uid'

function add (params) {
  return { id: uid(), ...params }
}

function remove(id) {
  return id
}

export default { add, remove }
