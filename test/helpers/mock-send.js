export default function mockSend(send = jest.fn()) {
  send.context = { send }

  send.childContextTypes = {
    send: () => null
  }

  return send
}
