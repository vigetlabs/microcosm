import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import NotFound from '../errors/notfound'
import ItemForm from './parts/item-form'
import ItemList from './parts/item-list'
import { Link } from 'react-router-dom'

class ListShow extends Presenter {
  getModel({ match }) {
    let { id } = match.params

    return {
      list: state => state.lists.find(list => list.id === id),
      items: state => state.items.filter(item => item.list === id)
    }
  }

  render() {
    const { list, items } = this.model

    if (!list) {
      return <NotFound resource="List" />
    }

    return (
      <div>
        <header className="header">
          <div className="container">
            <h1 className="text-display">
              <Link to="/">Lists</Link> › {list.name}
            </h1>
          </div>
        </header>

        <main role="main" className="container">
          <aside className="aside">
            <h2 className="subhead">New Item</h2>
            <ItemForm list={list.id} />
          </aside>

          <ItemList items={items} />
        </main>
      </div>
    )
  }
}

export default ListShow
