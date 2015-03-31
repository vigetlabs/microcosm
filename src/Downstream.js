import isMicrocosm from 'isMicrocosm'

export default {
  contextTypes: {
    app: isMicrocosm
  },

  send(action, ...params) {
    this.context.app.send(action, ...params)
  }
}
