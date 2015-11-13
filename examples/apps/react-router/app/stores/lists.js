import Lists from '../actions/lists'

export default {

  getInitialState() {
    return []
  },

  register() {
    return {
      [Lists.add]    : this.add,
      [Lists.remove] : this.remove
    }
  },

  add(state, params) {
    return state.concat(params)
  },

  remove(state, id) {
    return state.filter(i => i.id !== id)
  }

}
