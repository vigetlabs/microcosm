import Route from 'actions/route'

export default {

  getInitialState() {
    return {}
  },

  register() {
    return {
      [Route.set]: this.set
    }
  },

  set(state, params) {
    return params
  }

}
