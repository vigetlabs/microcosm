/**
 * Storage
 * Whenever the app changes, save the current state in localStorage
 */

let KEY = 'microcosm_seed'

export default {

  save(app) {
    localStorage.setItem(KEY, JSON.stringify(app))
  },

  fetch() {
    let raw = localStorage.getItem(KEY)

    try {
      return JSON.parse(raw) || {}
    } catch(x) {
      return {}
    }
  },

  register(app, options, next) {
    app.listen(() => this.save(app))
    app.push(this.fetch())

    next()
  }

}
