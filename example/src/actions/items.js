import { tag } from 'Microcosm'

export default tag({

  add(params, send) {
    send(null, params)
  },

  remove(id, send) {
    send(null, id)
  }

})
