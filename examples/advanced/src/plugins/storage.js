/**
 * Storage
 * Whenever the app changes, save the current state in localStorage
 */

let KEY = 'microcosm_seed'

function save (app) {
  localStorage.setItem(KEY, JSON.stringify(app))
}

function fetch() {
  let raw = localStorage.getItem(KEY)

  try {
    return JSON.parse(raw) || {}
  } catch(x) {
    return {}
  }
}

export function register (app, options, next) {
  app.listen(() => save(app))
  app.replace(fetch())
  next()
}
