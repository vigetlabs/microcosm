import DeleteIcon  from 'icons/delete'
import Icon        from 'fragments/Icon'
import Link        from 'fragments/Link'
import React       from 'react'

let ListItem = React.createClass({

  propTypes: {
    count    : React.PropTypes.number.isRequired,
    list     : React.PropTypes.object.isRequired,
    onRemove : React.PropTypes.func.isRequired
  },

  render() {
    let { list, count } = this.props
    let { color:background, contrast:color, name, id } = list

    return (
      <li className='list__item flex flex-align-center'>
        <Link href={ `/list/${id}` } className="list__item__link flex">
          <span className="list__item__counter" style={{ background, color }}>{ count }</span>
          <span className="flex-grow">{ name }</span>
        </Link>
        <Icon className="margin-2" src={ DeleteIcon } onClick={ this._onRemoveItem }>Delete</Icon>
      </li>
    )
  },

  _onRemoveItem() {
    this.props.onRemove(this.props.list.id)
  }
})

export default ListItem
