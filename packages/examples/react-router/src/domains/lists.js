import { SubjectHash, set } from 'microcosm'
import { groupBy } from 'lodash'
import uid from 'uid'
import Collection from './collection'

class Lists extends Collection {
  static create(params) {
    return { id: uid(), ...params }
  }

  static destroy(id) {
    return id
  }

  register() {
    return {
      [Lists.create]: this.add,
      [Lists.destroy]: this.remove
    }
  }

  withCounts(items) {
    return new SubjectHash({ items, lists: this }).map(next => {
      let groups = groupBy(items, 'list')

      return next.lists.map(list => {
        let group = groups[list.id]
        return set(list, 'count', group ? group.length : 0)
      })
    })
  }
}

export default Lists
