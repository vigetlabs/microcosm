import React from 'react'

let Layout = React.createClass({
  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  render() {
    let { app } = this.props

    return React.createElement(app.get(['route', 'handler']), {
      app    : app,
      params : app.get(['route', 'params'])
    })
  }
})

export default Layout
