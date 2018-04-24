import React from 'react'
import { Presenter } from 'microcosm-dom'
import NotFound from '../errors/notfound'
import ItemForm from './parts/item-form'
import ItemList from './parts/item-list'
import { Link } from 'react-router-dom'

class ListShow extends Presenter {
  getModel(repo, { match }) {
    let { id } = match.params

    return {
      list: repo.domains.lists.find({ id }),
      items: repo.domains.items.filter({ list: id })
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
