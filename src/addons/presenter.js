import shallowEqual from './connect/shallow-equal'

import { Component, PropTypes } from 'react'

export default class Presenter extends Component {

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
    if (shallowEqual(nextProps, this.props) === false) {
      this.updatePropMap(nextProps)
    }

    this.updateState()
  }

  updatePropMap(props) {
    this.propMap = this.viewModel ? this.viewModel(props) : {}
  }

  updateState() {
    let nextState = {}

    for (let key in this.propMap) {
      nextState[key] = this.propMap[key].call(this, this.app.state)
    }

    if (shallowEqual(this.state, nextState)) {
      return null
    }

    this.setState(nextState)
  }

  getChildContext() {
    return {
      send : this.send.bind(this)
    }
  }

  send(intent, ...params) {
    if (this[intent]) {
      return this[intent].apply(this, [ this.app, ...params ])
    }

    if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    throw new Error(`No Presenter implements intent “${ intent }”.`)
  }

}

Presenter.contextTypes = {
  app  : PropTypes.object,
  send : PropTypes.func
}

Presenter.childContextTypes = {
  send : PropTypes.func
}
