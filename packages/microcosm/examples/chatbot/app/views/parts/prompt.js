import React from 'react'
import ActionForm from 'microcosm/addons/action-form'

import { send } from '../../actions/messages'

const onSubmit = event => event.target.reset()

export default function Prompt() {
  return (
    <ActionForm action={send} onSubmit={onSubmit}>
      <label className="audible" htmlFor="message">
        Respond:
      </label>
      <input id="message" name="message" type="text" autoComplete="off" />
      <input type="submit" value="Reply" />
    </ActionForm>
  )
}
