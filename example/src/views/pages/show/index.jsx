import Banner      from './Banner'
import ListActions from 'actions/lists'
import React       from 'react'
import TaskList    from 'views/parts/TaskList'
import page        from 'page'

export default React.createClass({

  goHome() {
    page('/')
  },

  render() {
    let { app, lists, items, params } = this.props

    let list     = lists.filter(i => i.id === params.id)[0]
    let children = items.filter(i => i.list === list.id)

    return (
      <main role="main">
        <Banner list={ list } onRemove={ this._onRemoveList } />
        <TaskList app={ app } list={ list } items={ children } />
      </main>
    )
  },

  _onRemoveList() {
    let { app, params } = this.props
    app.push(ListActions.remove, params.id, this.goHome)
  }

})
