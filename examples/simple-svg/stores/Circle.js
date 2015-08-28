import { willStart } from 'src/Microcosm'
import { update } from '../actions/circle'

function getInitialState () {
  return set(null, Date.now())
}

function set (old, time) {
  let sin = Math.sin(time / 200)
  let cos = Math.cos(time / 200)

  return {
    cx : 50 * sin,
    cy : 35 * cos,
    r  : 12 + (8 * cos)
  }
}

export default function register () {
  return {
    [willStart] : getInitialState,
    [update]    : set
  }
}
