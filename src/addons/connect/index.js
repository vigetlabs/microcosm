import Microcosm      from '../../Microcosm'
import React          from 'react'
import getDisplayName from './get-display-name'
import hoistStatics   from 'hoist-non-react-statics'
import shallowEqual   from './shallow-equal'

const defaults = {
  pure    : true,
  valueOf : false
}

export default function connect (mapStateToProps, options) {
  options = { ...defaults, ...options }

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
        this.app.listen(this.updateState, this)
      }

      componentWillUnmount() {
        this.app.ignore(this.updateState, this)
      }

      componentWillReceiveProps(nextProps) {
        if (isPure && shallowEqual(nextProps, this.props)) {
          return null
        }

        this.updatePropMap(nextProps)
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

        return React.createElement(WrappedComponent, {
          app,
          ...props,
          ...state
        })
      }
    }

    Connect.displayName = `Connect(${getDisplayName(WrappedComponent)})`

    Connect.WrappedComponent = WrappedComponent

    Connect.contextTypes = {
      app: React.PropTypes.instanceOf(Microcosm)
    }

    Connect.propTypes = {
      app: React.PropTypes.instanceOf(Microcosm)
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}
