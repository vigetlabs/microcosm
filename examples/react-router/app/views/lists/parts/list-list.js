import React   from 'react'
import Destroy from './destroy'
import {Link}  from 'react-router'

function List ({ id, name, count }) {

  return (
    <li key={ id }>
      <Link to={ `/lists/${ id }` }>{ name } ({ count })</Link>
      <Destroy action="removeList" id={ id } />
    </li>
  )
}

function Empty () {
  return <p className="spacious">No lists</p>
}

export default function ListList ({ items = [] }) {

  return items.length ? <ul className="list">{ items.map(List) }</ul> : <Empty />
}
