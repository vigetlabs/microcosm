import Microcosm from '../microcosm'
import { Component, PropTypes, Children } from 'react'

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
  repo      : PropTypes.instanceOf(Microcosm).isRequired,
  children : PropTypes.element.isRequired
}

Provider.childContextTypes = {
  repo : PropTypes.instanceOf(Microcosm).isRequired
}
