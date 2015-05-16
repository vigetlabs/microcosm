export default {

  add(params, send) {
    send(null, params)
  },

  remove(id, send) {
    send(null, id)
  }

}
