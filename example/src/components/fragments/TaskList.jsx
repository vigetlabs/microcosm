import AddItem      from './AddItem'
import Downstream   from 'Downstream'
import ItemActions  from 'actions/items'
import React        from 'react'
import TaskListItem from './TaskListItem'

export default React.createClass({

  propTypes: {
    app  : React.PropTypes.object.isRequired,
    list : React.PropTypes.object.isRequired
  },

  getItem(item) {
    return (<TaskListItem key={ item.id } item={ item } onRemove={ this._onRemoveItem } />)
  },

  render() {
    let { items, list } = this.props

    return (
      <section className="container pad-1-bottom">
        <div className="fill-white shadow-1 radius-2 margin-5-top-reverse margin-2-bottom pad-2-left pad-2-right pad-2-bottom">
          <AddItem onSubmit={ this._onAddItem } />
        </div>

        <div className="fill-white shadow-1 radius-2 relative">
          <ul className="list">
            { items.map(this.getItem) }
          </ul>
        </div>
      </section>
    )
  },

  _onAddItem(name) {
    let { app, list } = this.props

    app.push(ItemActions.add, { name, list })
  },

  _onRemoveItem(item) {
    this.props.app.push(ItemActions.remove, item.id)
  }

})
