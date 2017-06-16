/**
 * @flow
 */

import type Presenter from 'microcosm/addons/presenter'
import { set } from 'microcosm' // eslint-ignore-line

type Snapshot = { [string]: * }

interface Model {
  call(presenter: Presenter, state: Snapshot, repo: Microcosm): *
}

export class ListsWithCounts implements Model {
  call(_presenter: Presenter, state: Snapshot) {
    const { lists, items } = state

    return lists.map(function(list) {
      let count = items.filter(i => i.list === list.id).length

      return set(list, 'count', count)
    })
  }
}

export class List implements Model {
  id: string

  constructor(id: string) {
    this.id = id
  }

  call(_presenter: Presenter, state: Snapshot) {
    const { lists } = state

    return lists.find(list => list.id === this.id)
  }
}

export class ListItems implements Model {
  id: string

  constructor(id: string) {
    this.id = id
  }

  call(_presenter: Presenter, state: Snapshot) {
    const { items } = state

    return items.filter(item => item.list === this.id)
  }
}
