import Lists from '../domains/lists'
import { visit } from './routing'

export function* addList(repo, params) {
  let list = yield repo.push(Lists.create, params)

  yield repo.push(visit, `/lists/${list.id}`)
}

export function* removeList(repo, id) {
  yield repo.push(Lists.destroy, id)
}
