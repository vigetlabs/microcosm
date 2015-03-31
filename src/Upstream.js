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
    this.props.app.send(action, ...params)
  }
}
