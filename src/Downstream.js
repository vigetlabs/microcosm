import isMicrocosm from 'isMicrocosm'

export default {
  contextTypes: {
    app: isMicrocosm
  },

  send(action, ...params) {
    let { app } = this.context
    app.send(action, ...params)
  }
}
