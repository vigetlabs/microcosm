import React from 'react'
import Form  from 'microcosm/addons/form'

export default function ListForm () {
  const onSuccess = (_, form) => form.reset()

  return (
    <Form intent="addList" onSuccess={ onSuccess }>
      <div className="textfield">
        <label htmlFor="list-name">Name</label>
        <input id="list-name" name="name" required />
      </div>

      <button className="btn">Create List</button>
    </Form>
  )
}
