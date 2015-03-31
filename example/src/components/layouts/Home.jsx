import AddIcon      from 'icons/add'
import AddList      from 'fragments/AddList'
import Icon         from 'fragments/Icon'
import ListItem     from 'fragments/ListItem'
import React        from 'react'
import TaskList     from 'fragments/TaskList'
import Upstream     from 'Upstream'

let Home = React.createClass({
  mixins: [ Upstream ],

  propTypes: {
    lists : React.PropTypes.array.isRequired,
    items : React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      openCreate: false
    }
  },

  getList(list) {
    let { items, app } = this.props

    return (<ListItem key={ list.id }
                      items={ items.filter(i => i.list === list.id) }
                      list={ list } />)
  },

  render() {
    let { app, lists } = this.props

    return (
      <main role="main">
        <header className="fill-primary relative ruled-bottom">
          <div className="container pad-9-top pad-7-bottom relative">
            <Icon className="fab absolute bottom right shadow-1"
                  src={ AddIcon }
                  onClick={ this._onToggle }/>

            <h1 className="type-display">Todo:</h1>
          </div>
        </header>

        <div className="container">
          <div className="fill-white margin-6-top-reverse margin-8-right shadow-1 radius-2 relative">
            <ul className="list">
              { lists.map(this.getList) }
            </ul>
          </div>
        </div>

        <AddList active={ this.state.openCreate } onExit={ this._onToggle } />
      </main>
    )
  },

  _onToggle() {
    this.setState({ openCreate: !this.state.openCreate })
  }

})

export default Home
