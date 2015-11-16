import { report } from '../actions/pixels'
import { update } from 'sprout-data'

const Pixels = {

  getInitialState() {
    return Array(15).join().split(',').map(_ => Array(15).join().split(','))
  },

  register() {
    return {
      [report](pixels, { x, y }) {
        return update(pixels, [y, x], val => val ? 0 :  1)
      }
    }
  }

}

export default Pixels
