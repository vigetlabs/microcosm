import { Domain } from 'microcosm'
import { animate } from '../actions/animate'

export default class Circle extends Domain {
  getInitialState() {
    return this.set(null, { color: 'orange', time: Date.now() })
  }

  set(_, { time, color }) {
    let sin = Math.sin(time / 200)
    let cos = Math.cos(time / 200)

    return {
      color: color,
      cx: 50 * sin,
      cy: 35 * cos,
      r: 12 + 8 * cos
    }
  }

  register() {
    return {
      [animate]: {
        next: this.set,
        complete: this.set
      }
    }
  }
}
