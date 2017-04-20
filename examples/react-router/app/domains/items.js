import { removeList } from '../actions/lists'
import { addItem, removeItem } from '../actions/items'

const Items = {
  getInitialState() {
    return []
  },

  add(items, params) {
    return items.concat({ name: 'Unspecified', ...params })
  },

  remove(item, unwanted) {
    return item.filter(i => i.id !== unwanted)
  },

  removeByList(items, list) {
    return items.filter(i => i.list !== list)
  },

  register() {
    return {
      [addItem]: Items.add,
      [removeItem]: Items.remove,
      [removeList]: Items.removeByList
    }
  }
}

export default Items
