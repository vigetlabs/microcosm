const Items = {

  all (state) {
    return state.items
  },

  childrenOf (id) {
    return function (state) {
      return Items.all(state).filter(item => item.list == id)
    }
  }

}

export default Items
