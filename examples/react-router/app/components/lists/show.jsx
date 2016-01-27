import Connect from '../../../../../src/addons/connect'
import ItemForm from './parts/item-form'
import Items, { addItem, removeItem } from '../../resources/items'
import Lists from '../../resources/lists'
import NotFound from '../notfound'
import React from 'react'
import {Link} from 'react-router'

const Presenter = Connect(function (props) {
  let { id } = props.params

  return {
    list  : Lists.get(id),
    items : Items.childrenOf(id)
  }
})

export default Presenter(React.createClass({

  renderItem({ id, name }) {
    return (
      <li key={ id }>
        { name }
        <button className="btn" onClick={ this.props.app.prepare(removeItem, id) }>
          Delete
        </button>
      </li>
    )
  },

  render() {
    let { app, list, items } = this.props

    if (!list) {
      return (<NotFound resource="List" />)
    }

    return (
      <div>
        <header className="header">
          <div className="container">
            <h1 className="text-display">
              <Link to="/">Lists</Link> › { list.name }
            </h1>
          </div>
        </header>

        <main role="main" className="container">
          <aside className="aside">
            <h2 className="subhead">New Item</h2>
            <ItemForm onSubmit={ this.props.app.prepare(addItem, list.id) } />
          </aside>

          <ul className="list">
            { items.map(this.renderItem) }
          </ul>
        </main>
      </div>
    )
  }
}))
