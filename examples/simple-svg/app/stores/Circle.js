import { animate } from '../actions/circle'

const Circle = {

  getInitialState() {
    return Circle.set(null, { color: 'orange', time: Date.now() })
  },

  set (_, { color, time }) {
    let sin = Math.sin(time / 200)
    let cos = Math.cos(time / 200)

    return {
      color : color,
      cx    : 50 * sin,
      cy    : 35 * cos,
      r     : 12 + (8 * cos)
    }
  },

  register () {
    return {
      [animate.loading] : Circle.set,
      [animate.done]    : Circle.set
    }
  }
}

export default Circle
