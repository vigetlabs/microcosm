import Banner      from './Banner'
import ListActions from 'actions/lists'
import React       from 'react'
import TaskList    from 'fragments/TaskList'
import children    from 'children'
import findBy      from 'findBy'
import page        from 'page'

export default React.createClass({

  render() {
    let { app, params } = this.props

    let list  = app.pull('lists', findBy, params.id)
    let items = app.pull('items', children, list)

    return (
      <main role="main">
        <Banner list={ list } onRemove={ this._onRemoveList } />
        <TaskList app={ app } list={ list } items={ items } />
      </main>
    )
  },

  _onRemoveList() {
    let { app, params } = this.props

    app.push(ListActions.remove, params.id)

    page('/')
  }

})
