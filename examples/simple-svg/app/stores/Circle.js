import { update } from '../actions/circle'

let Circle = {

  getInitialState() {
    return Circle.set(null, Date.now())
  },

  register() {
    return {
      [update]: Circle.set
    }
  },

  set(old, time) {
    let sin = Math.sin(time / 200)
    let cos = Math.cos(time / 200)

    return {
      cx : 50 * sin,
      cy : 35 * cos,
      r  : 12 + (8 * cos)
    }
  }

}

export default Circle
