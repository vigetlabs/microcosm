import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import { set } from 'microcosm/'
import ListForm from './parts/list-form'
import ListList from './parts/list-list'

class ListIndex extends Presenter {
  getModel () {
    return {
      lists: this.getListsWithCounts
    }
  }

  getListsWithCounts ({ lists, items }) {
    return lists.map(function (list) {
      let count = items.filter(i => i.list === list.id).length

      return set(list, 'count', count)
    })
  }

  render () {
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

export default ListIndex
