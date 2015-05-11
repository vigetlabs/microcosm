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
    let { app, params } = this.props

    let list  = app.refine('lists').find(i => i.id === params.id)
    let items = app.refine('items')

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
    this.goHome()
  }

})
