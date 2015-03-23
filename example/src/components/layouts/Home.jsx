import AddIcon      from 'icons/add'
import AddList      from 'fragments/AddList'
import Icon         from 'fragments/Icon'
import ListActions  from 'actions/lists'
import ListItem     from 'fragments/ListItem'
import React        from 'react'
import TaskList     from 'fragments/TaskList'

let Home = React.createClass({

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
    let items = this.props.items.filter(i => i.list === list.id)

    return (
      <ListItem key={ list.id } items={ items } list={ list } onDelete={ this._onDestroy } />
    )
  },

  render() {
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
              { this.props.lists.map(this.getList) }
            </ul>
          </div>
        </div>

        <AddList active={ this.state.openCreate }
                 onExit={ this._onToggle }
                 onCreate={ this._onCreate } />
      </main>
    )
  },

  _onToggle() {
    this.setState({ openCreate: !this.state.openCreate })
  },

  _onDestroy(id) {
    this.props.flux.send(ListActions.remove, id)
  },

  _onCreate(props) {
    this.props.flux.send(ListActions.add, props)
  }

})

export default Home
