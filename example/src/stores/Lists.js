import Lists    from 'actions/lists'
import contrast from 'contrast'

export default {

  getInitialState(seed=[]) {
    return seed
  },

  [Lists.add](state, params) {
    let record = { color : '#aaaaaa', id : state.length, ...params }

    record.contrast = contrast(record.color)

    return state.concat(record)
  },

  [Lists.remove](state, id) {
    return state.filter(list => list.id != id)
  },

  toString() {
    return 'lists'
  }

}
