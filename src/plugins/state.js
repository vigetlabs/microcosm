import Transaction from '../Transaction'
import dispatch    from '../dispatch'
import lifecycle   from '../lifecycle'
import merge       from '../merge'

const State = {

  getInitialState(app, data) {
    return dispatch(app.stores, data, new Transaction(lifecycle.willStart, app.state))
  },

  willReset(app, data) {
    return merge(State.getInitialState(app), data)
  },

  deserialize(app, data) {
    if (data == undefined) {
      return app.state
    }

    return dispatch(app.stores, data, new Transaction(lifecycle.willDeserialize, data))
  },

  serialize(app, state) {
    return dispatch(app.stores, state, new Transaction(lifecycle.willSerialize, state))
  }

}

export default State
