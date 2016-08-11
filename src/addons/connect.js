import React          from 'react'
import Presenter      from './presenter'
import hoistStatics   from 'hoist-non-react-statics'
import getDisplayName from './connect/get-display-name'
import merge          from '../merge'

/**
 * Used to associate a React component to an instance of
 * Microcosm. Additionally, it is used to listen for changes in
 * repo state and intelligently propagate computed properties.
 *
 * @param {Function} computer A function that returns a list of computed properties.
 * @param {{pure:Boolean}} options An object of settings for the connection
 */
export default function connect (computer, options) {

  return function wrapWithConnect(Component) {

    class Connect extends Presenter {
      viewModel(props) {
        return computer ? computer(props) : {}
      }

      render() {
        const props = merge({ repo: this.repo }, this.props, this.state)

        return React.createElement(Component, props)
      }
    }

    Connect.defaultProps     = options
    Connect.displayName      = `Connect(${getDisplayName(Component)})`
    Connect.WrappedComponent = Component

    return hoistStatics(Connect, Component)
  }
}
