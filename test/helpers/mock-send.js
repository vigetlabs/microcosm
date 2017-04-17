export default function mockPresenter (send = jest.fn()) {
  send.context = { send }

  send.childContextTypes = {
    send: (props, propName) => {
      console.assert(typeof props[propName] === 'function')
      return null
    }
  }

  return send
}
