import Banner      from './Banner'
import ListActions from 'actions/lists'
import React       from 'react'
import TaskList    from 'fragments/TaskList'
import page        from 'page'

export default React.createClass({

  render() {
    let { app, params } = this.props

    let list  = app.graft(['lists', params.id])
    let items = app.graft('items')

    return (
      <main role="main">
        <Banner list={ list } onRemove={ this._onRemoveList } />
        <TaskList list={ list } items={ items } />
      </main>
    )
  },

  _onRemoveList() {
    let { app, params } = this.props

    app.push(ListActions.remove, params.id)

    page('/')
  }

})
