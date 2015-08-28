import { updateRoute } from 'actions/route'
import { willStart } from 'src/Microcosm'

function getInitialState() {
  return {}
}

function set (state, params) {
  return params
}

export default function register() {
  return {
    [willStart]   : getInitialState,
    [updateRoute] : set
  }
}
