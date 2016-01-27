import Items from '../items'

const Lists = {

  all (state) {
    return state.lists
  },

  get (id) {
    return function (state) {
      return Lists.all(state).filter(list => list.id == id)[0]
    }
  },

  count (state) {
    return Lists.all(state).reduce(function(counts, list) {
      counts[list.id] = Items.childrenOf(list.id)(state).length
      return counts
    }, {})
  }

}

export default Lists
