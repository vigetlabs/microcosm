import Items from '../domains/items'

export function addItem(params) {
  return function*(repo) {
    yield repo.push(Items.create, params)
  }
}

export function removeItem(id) {
  return function*(repo) {
    yield repo.push(Items.destroy, id)
  }
}
