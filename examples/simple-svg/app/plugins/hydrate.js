export default function Hydrate (app, key) {
  if (key in window) {
    return app.replace(window[key])
  }
}
