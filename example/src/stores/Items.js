import Items from 'actions/items'
import Lists from 'actions/lists'

export default {

  getInitialState() {
    return []
  },

  [Items.add](state, { list, name }) {
    let record = { id: state.length, list: list.id, name }

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
