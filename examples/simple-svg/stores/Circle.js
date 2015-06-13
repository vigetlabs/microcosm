import { update } from '../actions/circle'

export default {
  getInitialState() {
    return update()
  },

  register() {
    return {
      [update]: this.set
    }
  },

  set(old, next) {
    return next
  }
}
