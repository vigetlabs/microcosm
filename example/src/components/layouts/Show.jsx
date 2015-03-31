import BackIcon    from 'icons/arrow-back'
import DeleteIcon  from 'icons/delete'
import Icon        from 'fragments/Icon'
import ItemActions from 'actions/items'
import Link        from 'fragments/Link'
import ListActions from 'actions/lists'
import React       from 'react'
import TaskList    from 'fragments/TaskList'
import contrast    from 'contrast'
import page        from 'page'
import Upstream    from 'Upstream'

let find = (array, pred) => array.filter(pred)[0]

let Show = React.createClass({
  mixins: [ Upstream ],

  render() {
    let list  = find(this.props.lists, i => i.id == this.props.params.id)
    let items = this.props.items.filter(i => i.list == list.id)
    let color = contrast(list.color)

    return (
      <main role="main">
        <header className="ruled-bottom" style={{ background: list.color, color }}>
          <div className="flex pad-2">
            <div className="flex-grow">
              <Icon src={ BackIcon } element={ Link } href="/" />
            </div>
            <Icon src={ DeleteIcon } onClick={ this._onRemoveList } />
          </div>
          <div className="container pad-2-top pad-7-bottom">
            <h1 className="type-display">{ list.name }</h1>
          </div>
        </header>

        <TaskList list={ list } items={ items } />
      </main>
    )
  },

  _onRemoveList() {
    this.send(ListActions.remove, this.props.params.id)
    page('/')
  }

})

export default Show
