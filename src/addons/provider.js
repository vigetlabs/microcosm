import React, { PropTypes, Children } from 'react'
import Microcosm from '../Microcosm'

const Provider = React.createClass({

  propTypes: {
    app      : PropTypes.instanceOf(Microcosm).isRequired,
    children : PropTypes.element.isRequired
  },

  childContextTypes: {
    app : PropTypes.instanceOf(Microcosm).isRequired
  },

  getChildContext() {
    return { app: this.props.app }
  },

  render() {
    return Children.only(this.props.children)
  }

})

export default Provider
