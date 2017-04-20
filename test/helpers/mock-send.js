export default function mockPresenter(send = jest.fn()) {
  send.context = { send }

  send.childContextTypes = {
    send: () => null
  }

  return send
}
