import AddList  from 'views/parts/AddList'
import Banner   from './Banner'
import Body     from './Body'
import React    from 'react'

let Home = React.createClass({
  propTypes: {
    app   : React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      openCreate: false
    }
  },

  render() {
    let { app } = this.props

    return (
      <main role="main">
        <Banner onToggle={ this._onToggle } />
        <Body lists={ app.refine('lists') } items={ app.refine('items') } />
        <AddList app={ app } active={ this.state.openCreate } onExit={ this._onToggle } />
      </main>
    )
  },

  _onToggle() {
    this.setState({ openCreate: !this.state.openCreate })
  }
})

export default Home
