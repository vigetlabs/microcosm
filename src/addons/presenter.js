import Microcosm from '../microcosm'
import shallowEqual from './connect/shallow-equal'

import React, { PropTypes } from 'react'

const Presenter = {

  contextTypes: {
    app  : PropTypes.instanceOf(Microcosm),
    send : PropTypes.func
  },

  propTypes: {
    app : PropTypes.instanceOf(Microcosm)
  },

  childContextTypes: {
    app  : PropTypes.instanceOf(Microcosm),
    send : PropTypes.func
  },

  getChildContext() {
    return {
      app  : this.app,
      send : this.send
    }
  },

  getInitialState() {
    this.app = this.props.app || this.context.app

    this.updatePropMap(this.props)

    return this.getState()
  },

  componentWillMount() {
    this.updateState()
  },

  componentDidMount() {
    this.app.on('change', this.updateState, true)
  },

  componentWillUnmount() {
    this.app.off('change', this.updateState)
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.pure === false || shallowEqual(nextProps, this.props) === false) {
      this.updatePropMap(nextProps)
    }

    this.updateState()
  },

  updatePropMap(props) {
    this.propMap = this.viewModel ? this.viewModel(props) : {}
  },

  updateState() {
    const next = this.getState()

    if (this.props.pure === false || shallowEqual(this.state, next) === false) {
      return this.setState(next)
    }
  },

  getState() {
    const nextState = {}

    for (let key in this.propMap) {
      nextState[key] = this.propMap[key].call(this, this.app.state)
    }

    return nextState
  },

  send(intent, ...params) {
    if (this[intent]) {
      return this[intent].apply(this, [ this.app, ...params ])
    }
    else if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    throw new Error(`No presenter implements intent “${ intent }”.`)
  }
}

export default React.createClass({
  mixins: [ Presenter ],

  render() {
    throw new Error('Presenter must implement a render method.')
  }
})
