import React from 'react'
import { Presenter } from 'microcosm-dom'
import ListForm from './parts/list-form'
import ListList from './parts/list-list'

export default class ListIndex extends Presenter {
  getModel(repo) {
    const { lists, items } = repo.domains

    return {
      lists: lists.withCounts(items)
    }
  }

  render() {
    const { lists } = this.model

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

          <ListList items={lists} />
        </main>
      </div>
    )
  }
}
