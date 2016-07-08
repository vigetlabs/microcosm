import { paint }  from '../actions/pixels'
import { update } from 'sprout-data'

const Pixels = {

  getInitialState() {
    return Array(15).join().split(',').map(() => Array(15).join().split(','))
  },

  flipBit(pixels, { x, y }) {
    return update(pixels, [y, x], val => val ? 0 :  1)
  },

  register() {
    return {
      [paint] : Pixels.flipBit
    }
  }

}

export default Pixels
