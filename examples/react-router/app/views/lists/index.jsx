import React    from 'react'
import ListForm from './parts/list-form'
import ListList from './parts/list-list'

export default function ListIndex ({ counts, lists }) {
  var rows = lists.map(function (list) {
    return { ...list, count: counts[list.id] }
  })

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1 className="text-display">Todos</h1>
        </div>
      </header>

      <main role="main" className="container">
        <aside className="aside">
          <h2 className="subhead">New List</h2>
          <ListForm />
        </aside>

        <ListList items={ lists } />
      </main>
    </div>
  )
}
