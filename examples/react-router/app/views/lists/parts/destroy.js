import React from 'react'
import Form  from 'microcosm/addons/form'

export default function Destroy ({ action, id }) {

  return (
    <Form action={ action }>
      <input type="hidden" name="id" value={ id } />
      <button className="btn">Delete</button>
    </Form>
  )
}
