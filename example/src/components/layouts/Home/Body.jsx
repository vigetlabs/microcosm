import ListActions from 'actions/lists'
import ListItem    from 'fragments/ListItem'
import React       from 'react'
import count       from 'count'

let Body = React.createClass({

  propTypes: {
    lists : React.PropTypes.array.isRequired,
    items : React.PropTypes.array.isRequired
  },

  getList(list) {
    let { app } = this.props

    return (
      <ListItem key={ list.id }
                count={ app.pull('items', count, list) }
                list={ list }
                onRemove={ this._onRemoveList } />)
  },

  render() {
    return (
      <div className="container">
        <div className="fill-white margin-6-top-reverse margin-8-right shadow-1 radius-2 relative">
          <ul className="list">
            { this.props.app.pull('lists').map(this.getList) }
          </ul>
        </div>
      </div>
    )
  },

  _onRemoveList(id) {
    this.props.app.push(ListActions.remove, id)
  }

})

export default Body
