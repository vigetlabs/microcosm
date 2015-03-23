import Route from 'actions/route'

export default {

  getInitialState() {
    return {}
  },

  [Route.set](state, params) {
    return params
  },

  toString() {
    return 'route'
  }

}
