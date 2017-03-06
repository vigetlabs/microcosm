import { update } from 'microcosm'
import { paint }  from '../actions/pixels'

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

  flip (pixels, { x, y }) {
    return update(pixels, [y, x], val => val ? 0 : 1, 0)
  },

  register() {
    return {
      [paint] : this.flip
    }
  }

}

export default Pixels
