import React from 'react'
import Form  from '../../../../../../src/addons/form'

export default function Destroy ({ intent, id }) {

  return (
    <Form intent={ intent }>
      <input type="hidden" name="id" value={ id } />
      <button className="btn">Delete</button>
    </Form>
  )
}
