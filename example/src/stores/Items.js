import Items from 'actions/items'
import Lists from 'actions/lists'
import uid      from 'uid'

export default {

  getInitialState() {
    return []
  },

  [Items.add](state, { list, name }) {
    let record = {
      id   : uid(),
      list : list.id,
      name : name
    }

    return state.concat(record)
  },

  [Items.remove](state, unwanted) {
    return state.filter(i => i.id !== unwanted)
  },

  [Lists.remove](state, unwanted) {
    return state.filter(i => i.list !== unwanted)
  }

}
