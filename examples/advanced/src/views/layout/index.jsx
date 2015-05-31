import React from 'react'

let Layout = React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  render() {
    let { app, route } = this.props

    return React.createElement(route.handler, {
      app    : app,
      params : route.params,
      ...this.props
    })
  }

})

export default Layout
