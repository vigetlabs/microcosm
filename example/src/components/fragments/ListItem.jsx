import DeleteIcon from 'icons/delete'
import Icon       from 'fragments/Icon'
import React      from 'react'
import Link       from 'fragments/Link'

let ListItem = React.createClass({

  propTypes: {
    list: React.PropTypes.object.isRequired
  },

  render() {
    let { list, items } = this.props
    let { color:background, contrast:color, name, id } = list

    return (
      <li className='list__item flex flex-align-center'>
        <Link href={ `/list/${id}` } className="list__item__link flex">
          <span className="list__item__counter" style={{ background, color }}>
            { items.length }
          </span>
          <span className="flex-grow">{ name }</span>
        </Link>
        <Icon className="margin-2" src={ DeleteIcon } onClick={ this._onRemoveItem }>Delete</Icon>
      </li>
    )
  },

  _onRemoveItem() {
    this.props.onDelete(this.props.list.id)
  }

})

export default ListItem
