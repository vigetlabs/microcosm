import React from 'react'
import ActionButton from 'microcosm/addons/action-button'
import Link from 'react-router-dom/Link'

import { removeList } from '../../../actions/lists'

function List({ id, name, count }) {
  return (
    <li key={id}>
      <Link to={`/lists/${id}`}>{name} ({count})</Link>
      <ActionButton className="btn" action={removeList} value={id}>
        Delete
      </ActionButton>
    </li>
  )
}

function Empty() {
  return <p className="spacious">No lists</p>
}

export default function ListList({ items = [] }) {
  return items.length ? <ul className="list">{items.map(List)}</ul> : <Empty />
}
