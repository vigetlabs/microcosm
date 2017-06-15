import Lists from '../domains/lists'
import { visit } from './routing'

export function addList(params) {
  return function*(repo) {
    let list = yield repo.push(Lists.create, params)

    yield repo.push(visit, `/lists/${list.id}`)
  }
}

export function removeList(id) {
  return function*(repo) {
    yield repo.push(Lists.destroy, id)
  }
}
