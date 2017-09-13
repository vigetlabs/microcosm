import { EventEmitter } from 'events'

export default class Bridge extends EventEmitter {
  constructor(wall) {
    super()

    this.setMaxListeners(Infinity)
    this.wall = wall

    wall.listen(message => {
      if (typeof message === 'string') {
        this.emit(message)
      } else {
        this.emit(message.event, message.payload)
      }
    })
  }

  send(event, payload) {
    this.wall.send({ event, payload: JSON.stringify(payload) })
  }

  log(message) {
    this.send('log', message)
  }
}
