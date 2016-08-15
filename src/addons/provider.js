import Microcosm from '../microcosm'
import React, { Component, Children } from 'react'

/**
 * Sets up the required context for a React component tree
 * so that an instance of Microcosm can be made available.
 *
 * @example
 * const repo = new Microcosm()
 *
 * // <ChildComponent /> will receive `repo` within its context.
 * ReactDOM.mount((
 *   <Provider repo={ repo }>
 *      <ChildComponent />
 *   </Provider>
 * ), document.getElementById('repo'))
 */
export default class Provider extends Component {
  getChildContext() {
    return { repo: this.props.repo }
  }

  render() {
    return Children.only(this.props.children)
  }
}

Provider.propTypes = {
  repo     : React.PropTypes.instanceOf(Microcosm).isRequired,
  children : React.PropTypes.element.isRequired
}

Provider.childContextTypes = {
  repo : React.PropTypes.instanceOf(Microcosm).isRequired
}
