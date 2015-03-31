import Banner      from './Banner'
import ListActions from 'actions/lists'
import React       from 'react'
import TaskList    from 'fragments/TaskList'
import Upstream    from 'Upstream'
import find        from 'find'
import page        from 'page'

let Show = React.createClass({
  mixins: [ Upstream ],

  render() {
    let { items, lists, params, props } = this.props

    let list = find(lists, i => i.id == params.id)

    return (
      <main role="main">
        <Banner list={ list } onRemove={ this._onRemoveList } />
        <TaskList list={ list } items={ items.filter(i => i.list == list.id) } />
      </main>
    )
  },

  _onRemoveList() {
    this.send(ListActions.remove, this.props.params.id)
    page('/')
  }

})

export default Show
