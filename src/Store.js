export default {

  getInitialState() {
    return undefined
  },

  serialize(state) {
    return state
  },

  deserialize(state = this.getInitialState()) {
    return state
  },

  toString() {
    throw new Error('Stores must implement a toString() method')
  }

}
