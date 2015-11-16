export default function Hydrate (app, key, next) {
  if (key in window) {
    return app.replace(window[key], next)
  }

  return next()
}
