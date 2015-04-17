import Lists    from '../actions/lists'
import contrast from '../../lib/contrast'
import uid      from 'uid'

export default {

  getInitialState() {
    return {}
  },

  [Lists.add](state, params) {
    let record = {
      id    : uid(),
      color : '#aaaaaa',
      ...params
    }

    record.contrast = contrast(record.color)

    state.set(record.id, record)
  },

  [Lists.remove](state, id) {
    state.remove(id)
  },

  toString() {
    return 'lists'
  }

}
