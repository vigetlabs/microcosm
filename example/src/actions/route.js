import { tag } from 'Microcosm'

export default tag({

  set(params, send) {
    send(null, params)
  }

})
