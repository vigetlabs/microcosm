export function updateSnapshot(state) {
  return action => {
    let payload = {}

    try {
      payload = JSON.parse(state)
    } catch (error) {
      action.reject(error)
    }

    action.resolve(payload)
  }
}
