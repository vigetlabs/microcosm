import Action from './Action'

export default {

  getInitialState() {
    return 'test'
  },

  [Action]() {
    return true
  },

  toString() {
    return 'dummy'
  }

}
