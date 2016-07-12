import Microcosm from '../microcosm'
import { Component, PropTypes, Children } from 'react'

/**
 * Sets up the required context for a React component tree
 * so that an instance of Microcosm can be made available.
 *
 * @example
 * const app = new Microcosm()
 *
 * // <ChildComponent /> will receive `app` within its context.
 * ReactDOM.mount((
 *   <Provider app={ app }>
 *      <ChildComponent />
 *   </Provider>
 * ), document.getElementById('app'))
 */
export default class Provider extends Component {
  /**
   * @private
   */
  getChildContext() {
    return { app: this.props.app }
  }

  /**
   * @private
   */
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
