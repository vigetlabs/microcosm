import React from 'react'
import Microcosm from '../microcosm'
import merge from '../merge'
import shallowEqual from '../shallow-equal'

const EMPTY = {}

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
class Presenter extends React.Component {

  constructor() {
    super(...arguments)

    this.ready = false

    this._boundSend = this.send.bind(this)
    this._boundSetRepo = this._setRepo.bind(this)
  }

  shouldComponentUpdate(props, state) {
    if (!this.ready || !this.pure) {
      return true
    }

    return !shallowEqual(props, this.props) || !shallowEqual(state, this.state)
  }

  componentWillUnmount () {
    this.teardown(this.repo, this.props)
    this.repo.teardown()
  }

  componentWillReceiveProps (nextProps) {
    if (this.pure === false || shallowEqual(nextProps, this.props) === false) {
      this._updatePropMap(nextProps)

      this.update(this.repo, nextProps)
    }

    this._updateState()
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

    return false
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
   * Opposite of setup. Useful for cleaning up side-effects.
   *
   * @param {Microcosm} repo - The presenter's Microcosm instance
   * @param {Object} props - The presenter's props
   */
  teardown (repo, props) {
    // NOOP
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
   * Used by the presenter to calculate it's internal state. This function must return
   * an object who's keys will be assigned to state, and who's values are functions that
   * are given the repo state and can return a specific point in that state.
   *
   * If none of the keys have changed, `this.updateState` will not set a new state.
   *
   * @param {Object} props - The presenter's props, or new props entering a presenter.
   * @returns {Object} The properties to assign to state
   */
  viewModel (props) {
    return EMPTY
  }

  /**
   * Alias for viewModel
   */
  model(props) {
    return this.viewModel(props)
  }

  view (model) {
    return model.children ? React.Children.only(model.children) : null
  }

  render () {
    var model = merge({}, this.props, this.state)

    return (
      <PresenterContext repo={this.props.repo} send={this._boundSend} setRepo={this._boundSetRepo}>
        {this.repo ? this.view.call(this, model) : null}
      </PresenterContext>
    )
  }

  _setRepo(repo) {
    this.repo = repo
    this.pure = this.props.hasOwnProperty('pure') ? this.props.pure : repo.pure

    this._updatePropMap(this.props)
    this.setState(this._getState())

    this.ready = true

    this.repo.on('change', this._updateState, this)

    this.setup(repo, this.props)
  }

  /**
   * @private
   */
  _updatePropMap (props) {
    this.propMap = this.model(props)
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
    const repoState = this.repo.state

    if (typeof this.propMap === 'function') {
      return this.propMap(repoState)
    }

    const nextState = {}

    for (let key in this.propMap) {
      const entry = this.propMap[key]

      nextState[key] = typeof entry === 'function' ? entry(repoState) : entry
    }

    return nextState
  }

}

class PresenterContext extends React.Component {

  static propTypes = {
    repo : React.PropTypes.object
  }

  static contextTypes = {
    repo : React.PropTypes.object,
    send : React.PropTypes.func
  }

  static childContextTypes = {
    repo : React.PropTypes.object,
    send : React.PropTypes.func
  }

  constructor() {
    super(...arguments)

    const repo = this.props.repo || this.context.repo

    this.repo = repo ? repo.fork() : new Microcosm()
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  componentWillMount() {
    this.props.setRepo(this.repo)
  }

  render() {
    return this.props.children
  }

  send(intent, ...params) {
    const action = this.props.send(intent, ...params)

    if (action === false) {
      if (this.context.send) {
        return this.context.send(intent, ...params)
      }

      console.warn(`No presenter implements intent “${ intent }”.`)
    }

    return action
  }

}


export default Presenter
