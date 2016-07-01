import React from 'react'
import Form  from 'microcosm/addons/form'

export default function ItemForm ({ list }) {
  const onSuccess = (_, form) => form.reset()

  return (
    <Form intent="addItem" onSuccess={ onSuccess }>
      <input type="hidden" name="list" value={ list } />

      <div className="textfield">
        <label htmlFor="item-name">Name</label>
        <input id="item-name" name="name" required />
      </div>

      <button className="btn">Add Item</button>
    </Form>
  )
}
