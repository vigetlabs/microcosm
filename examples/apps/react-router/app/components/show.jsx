import ItemActions from '../actions/items'
import ItemForm    from './parts/item-form'
import React       from 'react'
import { Link }    from 'react-router'

const ListShow = React.createClass({

  getItem({ id, name }) {
    let { app } = this.props

    return (
      <li key={ id }>
        { name }
        <button className="btn" onClick={ app.prepare(ItemActions.remove, id) }>
          Delete
        </button>
      </li>
    )
  },

  render() {
    let { app, lists, items, params } = this.props

    let list     = lists.filter(i => i.id === params.id)[0]
    let children = items.filter(i => i.list === list.id)

    return (
      <div>
        <header className="header">
          <div className="container">
            <h1 className="text-display">
              <Link to="home">Lists</Link> › { list.name }
            </h1>
          </div>
        </header>

        <main role="main" className="container">
          <aside className="aside">
            <h2 className="subhead">New Item</h2>
            <ItemForm onSubmit={ app.prepare(ItemActions.add, list.id) }/>
          </aside>

          <ul className="list">
            { children.map(this.getItem) }
          </ul>
        </main>
      </div>
    )
  }
})

export default ListShow
