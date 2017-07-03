import React from 'react'
import ActionButton from 'microcosm/addons/action-button'

import { removeItem } from '../../../actions/items'

function Item({ id, name }) {
  return (
    <li key={id}>
      {name}
      <ActionButton className="btn" action={removeItem} value={id}>
        Delete
      </ActionButton>
    </li>
  )
}

function Empty() {
  return <p className="spacious">No items</p>
}

export default function ItemList({ items }) {
  return items.length
    ? <ul className="list">
        {items.map(Item)}
      </ul>
    : <Empty />
}
