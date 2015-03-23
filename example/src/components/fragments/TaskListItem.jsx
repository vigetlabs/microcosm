import DeleteIcon from 'icons/delete'
import Icon       from 'fragments/Icon'
import React      from 'react'

let TaskListItem = React.createClass({

  propTypes: {
    item : React.PropTypes.object.isRequired
  },

  render() {
    return (
      <li className="list__item pad-2-left pad-2-right">
        <div className="flex flex-align-center">
          <p className="flex-grow">{ this.props.item.name }</p>
          <Icon src={ DeleteIcon } onClick={ this._onRemoveItem }>Delete</Icon>
        </div>
      </li>
    )
  },

  _onRemoveItem() {
    this.props.onDelete(this.props.item)
  }
})

export default TaskListItem
