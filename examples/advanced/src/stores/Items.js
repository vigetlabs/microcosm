import Items from 'actions/items'
import Lists from 'actions/lists'

export default {

  getInitialState() {
    return []
  },

  register() {
    return {
      [Items.add]    : this.add,
      [Items.remove] : this.remove,
      [Lists.remove] : this.removeListItems
    }
  },

  add(state, params) {
    return state.concat(
      Object.assign({}, params, { list: params.list.id })
    )
  },

  remove(state, unwanted) {
    return state.filter(i => i.id !== unwanted)
  },

  removeListItems(state, unwanted) {
    return state.filter(i => i.list !== unwanted)
  }

}
