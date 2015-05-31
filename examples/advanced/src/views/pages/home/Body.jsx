import ListActions from 'actions/lists'
import ListItem    from 'views/parts/ListItem'
import React       from 'react'

let Body = React.createClass({

  propTypes: {
    lists : React.PropTypes.array.isRequired,
    items : React.PropTypes.array.isRequired
  },

  getList(list) {
    let { app } = this.props

    let count = this.props.items.reduce(function(a, b) {
      return a + (b.list === list.id)
    }, 0)

    return (<ListItem key={ list.id }
                      count={ count }
                      list={ list }
                      onRemove={ this._onRemoveList } />)
  },

  render() {
    return (
      <div className="container">
        <div className="fill-white margin-6-top-reverse margin-8-right shadow-1 radius-2 relative">
          <ul className="list">
            { this.props.lists.map(this.getList) }
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
