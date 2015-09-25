import React from 'react'
import Router from 'react-router'

const Layout = React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return this.props.app.state
  },

  componentDidMount() {
    this.props.app.listen(this.setState, this)
  },

  render() {
    let { app, params } = this.props

    return (
      <Router.RouteHandler app={ app } params={ params } { ...this.state } />
    )
  }

})

export default Layout
