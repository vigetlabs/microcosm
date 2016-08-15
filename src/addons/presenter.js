import React, { Component } from 'react'
import Microcosm from '../microcosm'
import shallowEqual from './connect/shallow-equal'

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
export default class Presenter extends Component {

  constructor (props, context) {
    super(props, context)

    this.repo = props.repo || context.repo
    this.state = {}

    this.updatePropMap(props)
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  /**
   * Called before a presenter will mount it's view (returned from the
   * render method). This hook provides a way to "prepare" work before
   * rendering to the page.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterWillMount (repo, props) {
    // NOOP
  }

  /**
   * Called when a presenter receives new props. This hook provides a way to
   * perform new work if a presenter is given new props. For example: if a
   * route parameter changes.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The new props sent into the presenter
   */
  presenterWillReceiveProps (repo, props) {
    // NOOP
  }

  componentWillMount () {
    this.presenterWillMount(this.repo, this.props)
    this.updateState()
  }

  componentDidMount () {
    this._listener = this.updateState.bind(this)

    this.repo.on('change', this._listener, true)
  }

  componentWillUnmount () {
    this.repo.off('change', this._listener, true)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.pure === false || shallowEqual(nextProps, this.props) === false) {
      this.updatePropMap(nextProps)
    }

    this.presenterWillReceiveProps(this.repo, nextProps)

    this.updateState()
  }

  /**
   * Used by the presenter to calculate it's internal state. This function must return
   * an object who's keys will be assigned to state, and who's values are functions that
   * are given the repo state and can return a specific point in that state.
   *
   * If none of the keys have changed, `this.updateState` will not set a new state.
   *
   * @example
   * viewModel(props) {
   *   return {
   *     user: state => state.users.find(user => user.id == props.id)
   *   }
   * }
   *
   * @param {Object} props - The presenter's props, or new props entering a presenter.
   * @returns {Object} The properties to assign to state
   */
  viewModel(props) {
    return {}
  }

  updatePropMap (props) {
    this.propMap = this.viewModel(props)
  }

  updateState () {
    const next = this.getState()

    if (this.props.pure === false || shallowEqual(this.state, next) === false) {
      return this.setState(next)
    }
  }

  getState () {
    const nextState = {}

    for (let key in this.propMap) {
      const entry = this.propMap[key]

      nextState[key] = typeof entry === 'function' ? entry.call(this, this.repo.state) : entry
    }

    return nextState
  }

  register() {
    // NOOP
  }

  /**
   * Provides a way for views to send messages back to the presenter
   * in a way that does not require passing callbacks down through the
   * view. This method is exposed by the Presenter via the React context
   * API.
   *
   * Send bubbles. If the closest presenter does not implement the intent,
   * it will check it's parent presenter. This repeats until there is no parent,
   * in which case it throws an error.
   *
   * @param {string} intent - The name of a method the view wishes to invoke
   * @param {...any} params - Arguments to invoke the named method with
   */
  send (intent, ...params) {
    var registry = this.register()

    if (registry && registry[intent]) {
      return registry[intent].apply(this, [ this.repo, ...params ])
    }
    else if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    throw new Error(`No presenter implements intent “${ intent }”.`)
  }

  /**
   * Presenters require a render method. This will throw an error unless
   * implemented by a subclass.
   */
  render () {
    throw new Error('Presenter must implement a render method.')
  }

}

Presenter.propTypes = {
  repo : React.PropTypes.instanceOf(Microcosm)
}

Presenter.contextTypes = {
  repo : React.PropTypes.instanceOf(Microcosm),
  send : React.PropTypes.func
}

Presenter.childContextTypes = {
  repo : React.PropTypes.instanceOf(Microcosm),
  send : React.PropTypes.func
}
