import Microcosm from '../microcosm'
import { Component, PropTypes, Children } from 'react'

export default class Provider extends Component {
  getChildContext() {
    return { app: this.props.app }
  }

  render() {
    return Children.only(this.props.children)
  }
}

Provider.propTypes = {
  app      : PropTypes.instanceOf(Microcosm).isRequired,
  children : PropTypes.element.isRequired
}

Provider.childContextTypes = {
  app : PropTypes.instanceOf(Microcosm).isRequired
}
