import { addList, removeList } from '../actions/lists'

const Lists = {
  getInitialState () {
    return []
  },

  add (lists, params) {
    return lists.concat({ name: 'Unspecified', ...params })
  },

  remove (lists, unwanted) {
    return lists.filter(i => i.id !== unwanted)
  },

  register () {
    return {
      [addList]:    Lists.add,
      [removeList]: Lists.remove,
    }
  },
}

export default Lists
