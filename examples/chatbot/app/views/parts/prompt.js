import React from 'react'
import Form from 'microcosm/addons/form'

import {
  send
} from '../../actions/messages'

const onSubmit = (event) => event.target.reset()

export default function Prompt () {

  return (
    <Form action={send} onSubmit={onSubmit}>
      <label className="audible" htmlFor="message">Respond:</label>
      <input id="message" name="message" type="text" autoComplete="off" />
      <input type="submit" value="Reply" />
    </Form>
  )
}
