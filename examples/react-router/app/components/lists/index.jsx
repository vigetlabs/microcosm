import Connect  from '../../../../../src/addons/connect'
import ListForm from './parts/list-form'
import Lists, {addList, removeList} from '../../resources/lists'
import React from 'react'
import {Link} from 'react-router'

const Presenter = Connect(function (props) {
  return {
    lists  : Lists.all,
    counts : Lists.count
  }
})

export default Presenter(React.createClass({

  renderList({ id, name }) {
    let { app, counts } = this.props

    return (
      <li key={ id }>
        <Link to={ `/lists/${ id }` }>{ name } ({ counts[id] })</Link>
        <button className="btn" onClick={ app.prepare(removeList, id) }>
          Delete
        </button>
      </li>
    )
  },

  render() {
    let { app, lists } = this.props

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
            <ListForm onSubmit={ app.prepare(addList) }/>
          </aside>

          <ul className="list">
            { lists.map(this.renderList) }
          </ul>
        </main>
      </div>
    )
  }
}))
