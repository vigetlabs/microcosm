import Action from './Action'

export default {

  getInitialState(seed='test') {
    return seed
  },

  [Action]() {
    return true
  },

  deserialize(data) {
    return data
  },

  toString() {
    return 'dummy'
  }

}
