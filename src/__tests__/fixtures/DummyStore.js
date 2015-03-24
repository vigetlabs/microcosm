import Action from './Action'

export default {

  getInitialState(seed='test') {
    return seed
  },

  [Action]() {
    return true
  },

  toString() {
    return 'dummy'
  }

}
