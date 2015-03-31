import ListItem from 'fragments/ListItem'
import React    from 'react'

let Body = React.createClass({

  propTypes: {
    lists: React.PropTypes.array.isRequired
  },

  getList(list) {
    let { items } = this.props

    return (<ListItem key={ list.id }
                      items={ items.filter(i => i.list === list.id) }
                      list={ list } />)
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
  }

})

export default Body
