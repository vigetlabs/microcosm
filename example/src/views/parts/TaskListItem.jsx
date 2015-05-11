import DeleteIcon from 'assets/icons/delete'
import Icon       from './Icon'
import React      from 'react'

let TaskListItem = React.createClass({

  propTypes: {
    item     : React.PropTypes.object.isRequired,
    onRemove : React.PropTypes.func.isRequired
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
    this.props.onRemove(this.props.item)
  }
})

export default TaskListItem
