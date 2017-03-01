import React from 'react'

export default function mockPresenter (send = jest.fn()) {
  send.context = { send }

  send.childContextTypes = {
    send: React.PropTypes.func
  }

  return send
}
