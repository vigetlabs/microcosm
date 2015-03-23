import Items from 'actions/items'
import Lists from 'actions/lists'

let id = 0

export default {

  getInitialState(seed=[]) {
    return seed
  },

  [Items.add](state, { list, name }) {
    let record = {
      id   : `item-${id++}`,
      list : list.id,
      name : name
    }

    return state.concat(record)
  },

  [Items.remove](state, unwanted) {
    return state.filter(item => item.id !== unwanted)
  },

  [Lists.remove](state, unwanted) {
    return state.filter(item => item.list !== unwanted)
  },

  toString() {
    return 'items'
  }

}
