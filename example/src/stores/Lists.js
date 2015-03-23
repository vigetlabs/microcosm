import Lists    from 'actions/lists'
import contrast from 'contrast'
import uid      from 'uid'

export default {

  getInitialState(seed=[]) {
    return seed
  },

  [Lists.add](state, params) {
    let record = {
      id    : uid(),
      color : '#aaaaaa',
      ...params
    }

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
