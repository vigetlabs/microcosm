/**
 * Intent
 * Generates a function that creates the glue between actions and stores.
 */

import dispatch   from './dispatch'
import transpose  from './transpose'
import {identify} from './prefix'

export default dispatcher => {
  return (methods, id) => {
    return transpose(methods, (method, name) => {
      let type = identify(id, name)
      return (...args) => dispatch(dispatcher, type, method(...args))
    }, {})
  }
}
