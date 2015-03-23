import Items from 'stores/Items'
import Lists from 'stores/Lists'
import React from 'react'
import Route from 'stores/Route'

let Layout = React.createClass({

  propTypes: {
    flux: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return this.getState()
  },

  getState() {
    let { flux } = this.props

    return {
      items : flux.get(Items),
      lists : flux.get(Lists),
      route : flux.get(Route)
    }
  },

  componentDidMount() {
    this.props.flux.listen(_ => this.setState(this.getState))
  },

  render() {
    let { items, lists, route } = this.state

    return React.createElement(route.handler, {
      flux   : this.props.flux,
      items  : items,
      lists  : lists,
      params : route.params,
    })
  }
})

export default Layout
