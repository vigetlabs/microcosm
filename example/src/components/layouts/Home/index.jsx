import AddList  from 'fragments/AddList'
import Banner   from './Banner'
import Body     from './Body'
import React    from 'react'
import Upstream from 'Upstream'

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

  render() {
    return (
      <main role="main">
        <Banner onToggle={ this._onToggle } />
        <Body lists={ this.props.lists } items={ this.props.items } />
        <AddList active={ this.state.openCreate } onExit={ this._onToggle } />
      </main>
    )
  },

  _onToggle() {
    this.setState({ openCreate: !this.state.openCreate })
  }
})

export default Home
