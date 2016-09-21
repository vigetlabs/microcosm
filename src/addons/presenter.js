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

    this.repo = this._getRepo()
    this.pure = this._getRepoPurity(this.repo, this.props)

    this._updatePropMap(this.props)
    this.state = this._getState()

    if (this.repo) {
      this.repo.on('change', this._updateState, this)
    }
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  /**
   * Called when a presenter is created, before it has calculated a view model.
   * Useful for fetching data and other prep-work.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  setup (repo, props) {
    // NOOP
  }

  /**
   * Called when a presenter gets new props. This is useful for secondary
   * data fetching and other work that must happen when a Presenter receives
   * new information
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  update (repo, props) {
    // NOOP
  }

  /**
   * Teardown subscriptions and other behavior.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   */
  teardown () {
    if (this.repo) {
      this.repo.off('change', this._updateState)
    }
  }

  componentWillMount() {
    this.setup(this.repo, this.props)
  }

  componentWillUnmount () {
    this.teardown()
  }

  componentWillReceiveProps (nextProps) {
    if (this.pure === false || shallowEqual(nextProps, this.props) === false) {
      this._updatePropMap(nextProps)
      this.update(this.repo, nextProps)
    }

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
    this.propMap = this.viewModel ? this.viewModel(props) : {}

    if (this.repo && this.propMap === this.repo.state) {
      console.warn("The view model for this presenter returned repo.state. " +
                   "This method onlys run when a presenter is given new properties. " +
                   "If you would like to subscribe to all state changes, return a " +
                   "function like: `(state) => state`.")
    }
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
    const repoState = this._getRepoState()

    if (typeof this.propMap === 'function') {
      return this.propMap(repoState)
    }

    const nextState = {}

    for (let key in this.propMap) {
      const entry = this.propMap[key]

      nextState[key] = typeof entry === 'function' ? entry.call(this, repoState) : entry
    }

    return nextState
  }

  /**
   * @private
   */
  _getRepo() {
    return this.props.repo || this.context.repo
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
    if (props.hasOwnProperty('pure')) {
      return !!props.pure
    }

    return repo ? repo.pure : false
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

  render () {
    return this.props.children ? React.Children.only(this.props.children) : null
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
