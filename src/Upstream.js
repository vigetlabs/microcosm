import isMicrocosm from 'isMicrocosm'

export default {
  childContextTypes: {
    app: isMicrocosm
  },

  getChildContext() {
    return {
      app: this.props.app || this.context.app
    }
  },

  send(action, ...params) {
    let { app } = this.props
    app.send(action, ...params)
  }
}
