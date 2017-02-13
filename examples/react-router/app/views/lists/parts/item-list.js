import React   from 'react'
import Destroy from './destroy'

function Item ({ id, name }) {

  return (
    <li key={ id }>
      { name }
      <Destroy action="removeItem" id={ id } />
    </li>
  )
}

function Empty () {
  return <p className="spacious">No items</p>
}

export default function ItemList ({ items }) {

  return items.length ? <ul className="list">{ items.map(Item) }</ul> : <Empty />
}
