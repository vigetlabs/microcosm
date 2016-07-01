import React          from 'react'
import hoistStatics   from 'hoist-non-react-statics'
import getDisplayName from './connect/get-display-name'
import shallowEqual   from './connect/shallow-equal'

const defaults = {
  pure    : true,
  valueOf : false
}

export default function connect (mapStateToProps, options) {
  options = Object.assign({}, defaults, options)

  const isPure = !!options.pure
  const useValueOf = !!options.valueOf

  return function wrapWithConnect(WrappedComponent) {

    class Connect extends React.Component {

      constructor(props, context) {
        super(props, context)

        this.app   = props.app || context.app
        this.state = {}

        this.updatePropMap(props)
      }

      componentWillMount() {
        this.updateState()
      }

      componentDidMount() {
        this._listener = this.updateState.bind(this)
        this.app.on('change', this._listener)
      }

      componentWillUnmount() {
        this.app.off('change', this._listener)
      }

      componentWillReceiveProps(nextProps) {
        if (!(isPure && shallowEqual(nextProps, this.props))) {
          this.updatePropMap(nextProps)
        }

        this.updateState()
      }

      updatePropMap(props) {
        this.propMap = mapStateToProps ? mapStateToProps(props) : {}
      }

      updateState() {
        let propMap   = this.propMap
        let nextState = {}

        for (let key in propMap) {
          let answer = propMap[key](this.app.state)

          if (useValueOf) {
            answer = answer ? answer.valueOf() : answer
          }

          nextState[key] = answer
        }

        if (isPure && shallowEqual(this.state, nextState)) {
          return null
        }

        this.setState(nextState)
      }

      render() {
        let { app, props, state } = this

        return React.createElement(WrappedComponent, Object.assign({ app }, props, state))
      }
    }

    Connect.displayName = `Connect(${getDisplayName(WrappedComponent)})`

    Connect.WrappedComponent = WrappedComponent

    Connect.contextTypes = {
      app: React.PropTypes.object
    }

    Connect.propTypes = {
      app: React.PropTypes.object
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}
