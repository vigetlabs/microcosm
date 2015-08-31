import { willStart } from 'src/Microcosm'
import { addItem, removeItem } from 'actions/items'
import { removeList } from 'actions/lists'

function getInitialState() {
  return []
}

function add(state, params) {
  return state.concat(
    Object.assign({}, params, { list: params.list.id })
  )
}

function remove(state, unwanted) {
  return state.filter(i => i.id !== unwanted)
}

function removeListItems(state, unwanted) {
  return state.filter(i => i.list !== unwanted)
}

export default function register () {
  return {
    [addItem]    : add,
    [removeItem] : remove,
    [removeList] : removeListItems,
    [willStart]  : getInitialState
  }
}
