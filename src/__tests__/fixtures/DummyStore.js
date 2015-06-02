import Action from './Action'

export default {
  getInitialState() {
    return 'test'
  },

  register() {
    return {
      [Action]: (old, next) => next
    }
  }
}
