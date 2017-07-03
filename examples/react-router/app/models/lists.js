import { set } from 'microcosm'

export class ListsWithCounts {
  call(_presenter, state) {
    const { lists, items } = state

    return lists.map(function(list) {
      let count = items.filter(i => i.list === list.id).length

      return set(list, 'count', count)
    })
  }
}

export class List {
  constructor(id) {
    this.id = id
  }

  call(_presenter, state) {
    const { lists } = state

    return lists.find(list => list.id === this.id)
  }
}

export class ListItems {
  constructor(id) {
    this.id = id
  }

  call(_presenter, state) {
    const { items } = state

    return items.filter(item => item.list === this.id)
  }
}
