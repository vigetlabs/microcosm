import React   from 'react'
import Destroy from './destroy'
import {Link}  from 'react-router'

function List ({ id, name, count }) {
  const link = `/react-router/lists/${ id }`

  return (
    <li key={ id }>
      <Link to={ link }>{ name } ({ count })</Link>
      <Destroy intent="removeList" id={ id } />
    </li>
  )
}

function Empty () {
  return <p className="spacious">No lists</p>
}

export default function ListList ({ items = [] }) {

  return items.length ? <ul className="list">{ items.map(List) }</ul> : <Empty />
}
