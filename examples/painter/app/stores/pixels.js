import { paint }  from '../actions/pixels'
import { update } from 'sprout-data'

const Pixels = {

  getInitialState() {
    const matrix = []

    while (matrix.length < 15) {
      const row = []

      while (row.length < 15) {
        row.push(0)
      }

      matrix.push(row)
    }

    return matrix
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
