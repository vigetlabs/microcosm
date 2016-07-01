import React    from 'react'
import ItemForm from './parts/item-form'
import NotFound from '../notfound'
import ItemList from './parts/item-list'
import {Link}   from 'react-router'

export default function ListShow ({ list, items }) {
  if (!list) {
    return <NotFound resource="List" />
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1 className="text-display">
            <Link to="/react-router">Lists</Link> › { list.name }
          </h1>
        </div>
      </header>

      <main role="main" className="container">
        <aside className="aside">
          <h2 className="subhead">New Item</h2>
          <ItemForm list={ list.id } />
        </aside>

        <ItemList items={ items } />
      </main>
    </div>
  )
}
