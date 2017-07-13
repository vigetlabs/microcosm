import Items from '../domains/items'

export function* addItem(repo, params) {
  yield repo.push(Items.create, params)
}

export function* removeItem(repo, id) {
  yield repo.push(Items.destroy, id)
}
