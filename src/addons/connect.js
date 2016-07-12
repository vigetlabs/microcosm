import React          from 'react'
import Presenter      from './presenter'
import hoistStatics   from 'hoist-non-react-statics'
import getDisplayName from './connect/get-display-name'

export default function connect (mapStateToProps, options) {

  return function wrapWithConnect(Component) {

    class Connect extends Presenter {

      viewModel(props) {
        return mapStateToProps ? mapStateToProps(props) : {}
      }

      render() {
        const props = { ...this.props, ...this.state, app: this.app }

        return React.createElement(Component, props)
      }
    }

    Connect.defaultProps     = options
    Connect.displayName      = `Connect(${getDisplayName(Component)})`
    Connect.WrappedComponent = Component

    return hoistStatics(Connect, Component)
  }
}
