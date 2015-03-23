import AddItem      from './AddItem'
import React        from 'react'
import TaskListItem from './TaskListItem'

let TaskList = React.createClass({

  propTypes: {
    list: React.PropTypes.object.isRequired
  },

  getItem(item) {
    return (<TaskListItem key={ item.id } item={ item } onDelete={ this._onRemoveItem } />)
  },

  render() {
    let { color, id, name } = this.props.list

    return (
      <section className="container pad-1-bottom">
        <div className="fill-white shadow-1 radius-2 margin-5-top-reverse margin-2-bottom pad-2-left pad-2-right pad-2-bottom">
          <AddItem onSubmit={ this._onAddItem } />
        </div>

        <div className="fill-white shadow-1 radius-2 relative">
          <ul className="list">
            { this.props.items.map(this.getItem) }
          </ul>
        </div>
      </section>
    )
  },

  _onAddItem(name) {
    this.props.onAddItem(this.props.list, name)
  },

  _onRemoveItem(item) {
    this.props.onRemoveItem(item)
  }

})

export default TaskList
