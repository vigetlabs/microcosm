import Route from 'actions/route'

export default {

  getInitialState() {
    return {}
  },

  [Route.set](state, params) {
    state.set(params)
  }

}
