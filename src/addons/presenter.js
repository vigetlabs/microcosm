import React, { Component } from 'react'
import Microcosm from '../microcosm'
import shallowEqual from '../shallow-equal'

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
export default class Presenter extends Component {

  constructor (props, context) {
    super(props, context)

    this.repo = props.repo || context.repo

    this.pure = this._getRepoPurity(this.repo, this.props)

    this._updatePropMap(this.props)

    this.state = this._getState()
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  /**
   * Proxy to componentWillMount
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterWillMount (repo, props) {
    // NOOP
  }

  /**
   * Proxy to componentDidMount.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterDidMount (repo, props) {
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

  /**
   * Proxy to componentWillUpdate.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterWillUpdate (repo, props) {
    // NOOP
  }

  /**
   * Proxy to componentWillUnmount.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterWillUnmount (repo, props) {
    // NOOP
  }

  /**
   * Proxy to componentWillUpdate.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  presenterDidUpdate (repo, props) {
    // NOOP
  }

  componentWillMount () {
    this.presenterWillMount(this.repo, this.props)
  }

  componentDidMount () {
    this._listener = this._updateState.bind(this)

    this.repo.on('change', this._listener, true)

    this.presenterDidMount(this.repo, this.props)
  }

  componentWillUpdate (props) {
    this.presenterWillUpdate(this.repo, props)
  }

  componentDidUpdate (props) {
    this.presenterDidUpdate(this.repo, props)
  }

  componentWillUnmount () {
    this.repo.off('change', this._listener, true)
    this.presenterWillUnmount(this.repo, this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (this.pure === false || shallowEqual(nextProps, this.props) === false) {
      this._updatePropMap(nextProps)
    }

    this.presenterWillReceiveProps(this.repo, nextProps)

    this._updateState()
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
  viewModel (props) {
    return {}
  }

  /**
   * @private
   */
  _updatePropMap (props) {
    this.propMap = this.viewModel(props)
  }

  /**
   * @private
   */
  _updateState () {
    const next = this._getState()

    if (this.pure === false || shallowEqual(this.state, next) === false) {
      return this.setState(next)
    }
  }

  /**
   * @private
   */
  _getState () {
    const nextState = {}
    const repoState = this._getRepoState()

    for (let key in this.propMap) {
      const entry = this.propMap[key]

      nextState[key] = typeof entry === 'function' ? entry.call(this, repoState) : entry
    }

    return nextState
  }

  /**
   * @private
   */
  _getRepoState() {
    return this.repo ? this.repo.state : {}
  }

  /**
   * @private
   */
  _getRepoPurity(repo, props) {
    if (repo) {
      return props.hasOwnProperty('pure') ? props.pure : repo.pure
    }

    return !!props.pure
  }

  /**
   * Expose "intent" subscriptions to child components. This is used with the <Form />
   * add-on to improve the ergonomics of presenter/view communication (though this only
   * occurs from the view to the presenter).
   *
   * @return {Object} A list of subscriptions
   */
  register () {
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
    } else if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    console.warn(`No presenter implements intent “${ intent }”.`)
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
