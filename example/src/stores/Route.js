import Route from 'actions/route'

export default {

  getInitialState() {
    return {}
  },

  [Route.set](state, { params, handler }) {
    state.set({ params, handler })
  },

  toString() {
    return 'route'
  }

}
