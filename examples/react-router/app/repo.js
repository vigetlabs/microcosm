import Microcosm, { set } from 'microcosm'
import Items from './domains/items'
import Lists from './domains/lists'

export default class Repo extends Microcosm {

  setup() {
    this.addDomain('lists', Lists)
    this.addDomain('items', Items)

    // Maintain a count of all items for every list
    this.index('lists-with-counts', 'lists,items', this.getListsWithCounts)
  }

  getListsWithCounts ({ lists, items }) {
    return lists.map(function (list) {
      let count = items.filter(i => i.list === list.id).length

      return set(list, 'count', count)
    })
  }

}
