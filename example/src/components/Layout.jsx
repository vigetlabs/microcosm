import Items from 'stores/Items'
import Lists from 'stores/Lists'
import React from 'react'
import Route from 'stores/Route'

let App = React.createClass({

  propTypes: {
    flux: React.PropTypes.object.isRequired
  },

  componentDidMount() {
    this.props.flux.listen(_ => this.forceUpdate())
  },

  render() {
    let route = this.props.flux.get(Route)

    return React.createElement(route.handler, {
      flux   : this.props.flux,
      items  : this.props.flux.get(Items),
      lists  : this.props.flux.get(Lists),
      params : route.params,
    })
  }
})

export default App
