import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import ListForm from './parts/list-form'
import ListList from './parts/list-list'
import { ListsWithCounts } from '../../models/lists'

export default class ListIndex extends Presenter {
  getModel() {
    return {
      lists: new ListsWithCounts()
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
