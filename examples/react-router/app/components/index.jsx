import ListActions from '../actions/lists'
import ListForm    from './parts/list-form'
import React       from 'react'
import { Link }    from 'react-router'

const ListIndex = React.createClass({

  propTypes: {
    app : React.PropTypes.object.isRequired
  },

  getList({ id, name }) {
    let { app, items } = this.props

    let count = items.filter(item => item.list === id).length

    return (
      <li key={ id }>
        <Link to="list" params={{ id }}>{ name } ({ count })</Link>
        <button className="btn" onClick={ app.prepare(ListActions.remove, id) }>
          Delete
        </button>
      </li>
    )
  },

  render() {
    let { app, lists, items } = this.props

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
            <ListForm onSubmit={ app.prepare(ListActions.add) }/>
          </aside>

          <ul className="list">
            { lists.map(this.getList) }
          </ul>
        </main>
      </div>
    )
  }

})

export default ListIndex
