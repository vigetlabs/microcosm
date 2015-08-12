import Lists    from '../actions/lists'
import contrast from '../../lib/contrast'

export default {

  getInitialState() {
    return []
  },

  register() {
    return {
      [Lists.add]    : this.add,
      [Lists.remove] : this.remove
    }
  },

  add(state, params) {
    let record = Object.assign({
      color : '#aaaaaa'
    }, params)

    record.contrast = contrast(record.color)

    return state.concat(record)
  },

  remove(state, id) {
    return state.filter(i => i.id !== id)
  }

}
