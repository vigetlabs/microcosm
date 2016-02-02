import Transaction from '../Transaction'
import dispatch    from '../dispatch'
import lifecycle   from '../lifecycle'
import merge       from '../merge'

const State = {

  [lifecycle.willStart](app) {
    return dispatch(app.stores, {}, new Transaction(lifecycle.willStart, app.state))
  },

  [lifecycle.willReset](app, data) {
    return merge(State.getInitialState(app), data)
  },

  [lifecycle.willDeserialize](app, data) {
    if (data == undefined) {
      return app.state
    }

    return dispatch(app.stores, data, new Transaction(lifecycle.willDeserialize, data))
  },

  [lifecycle.willSerialize](app, state) {
    return dispatch(app.stores, state, new Transaction(lifecycle.willSerialize, state))
  }

}

export default State
