import Items from 'actions/items'
import Lists from 'actions/lists'
import uid      from 'uid'

export default {

  getInitialState() {
    return {}
  },

  [Items.add](state, { list, name }) {
    let record = {
      id   : uid(),
      list : list.id,
      name : name
    }

    state.set(record.id, record)
  },

  [Items.remove](state, unwanted) {
    state.remove(unwanted)
  },

  [Lists.remove](state, unwanted) {
    state.filter(i => i.list === unwanted)
         .map(i => i.id)
         .forEach(state.remove, state)
  }

}
