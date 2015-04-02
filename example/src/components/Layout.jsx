import React from 'react'

let Layout = React.createClass({
  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  render() {
    let { app, items, lists, route } = this.props

    return React.createElement(route.handler, {
      app    : app,
      items  : items,
      lists  : lists,
      params : route.params,
    })
  }
})

export default Layout
