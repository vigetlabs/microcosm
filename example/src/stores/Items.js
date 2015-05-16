import Items from 'actions/items'
import Lists from 'actions/lists'
import uid      from 'uid'

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

  add(state, { list, name }) {
    let record = {
      id   : uid(),
      list : list.id,
      name : name
    }

    return state.concat(record)
  },

  remove(state, unwanted) {
    return state.filter(i => i.id !== unwanted)
  },

  removeListItems(state, unwanted) {
    return state.filter(i => i.list !== unwanted)
  }

}
