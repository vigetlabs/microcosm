export default {
  getInitialState() {
    return undefined
  },

  serialize(state) {
    return state
  },

  deserialize(state = this.getInitialState()) {
    return state
  }
}
