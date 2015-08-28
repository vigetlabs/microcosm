import contrast from '../../lib/contrast'
import { addList, removeList } from '../actions/lists'
import { willStart } from 'src/Microcosm'

function getInitialState() {
  return []
}

function add(state, params) {
  let record = Object.assign({
    color : '#aaaaaa'
  }, params)

  record.contrast = contrast(record.color)

  return state.concat(record)
}

function remove(state, id) {
  return state.filter(i => i.id !== id)
}

export default function register() {
  return {
    [addList]    : add,
    [removeList] : remove
  }
}
