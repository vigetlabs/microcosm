import lifecycle from '../lifecycle'
import merge     from '../merge'

const State = {

  register(app) {
    return app.push(lifecycle.willStart)
  },

  [lifecycle.willStart](app) {
    return app.dispatch({}, lifecycle.willStart, app.state)
  },

  [lifecycle.willReset](app, data) {
    return merge(State.getInitialState(app), data)
  },

  [lifecycle.willDeserialize](app, data) {
    if (data == undefined) {
      return app.state
    }

    return app.dispatch(data, lifecycle.willDeserialize, data)
  },

  [lifecycle.willSerialize](app, state) {
    return app.dispatch(state, lifecycle.willSerialize, state)
  }

}

export default State
