import React from 'react'
import Microcosm from '../microcosm'
import merge from '../merge'
import tag from '../tag'
import shallowEqual from '../shallow-equal'

function getName (presenter) {
  return presenter.constructor.name || 'Presenter'
}

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
class Presenter extends React.Component {

  constructor () {
    super(...arguments)

    // Allow overriding render, generate the context wrapper
    // upon instantiation
    if (this.render !== Presenter.prototype.render) {
      console.error('Presenter::render is a protected method. Instead of overriding it, please use Presenter::view.')
    }
  }

  shouldComponentUpdate (props, state) {
    return this._isImpure() ||
           !shallowEqual(this.props, props) ||
           !shallowEqual(this.state, state)
  }

  _setRepo (repo) {
    this.repo = repo

    this.setup(repo, this.props, this.props.state)

    this.repo.on('teardown', () => this.teardown(repo, this.props, this.state))
  }

  _connectSend (send) {
    this.send = send
  }

  _isImpure () {
    if (this.props.hasOwnProperty('pure')) {
      return this.props.pure !== true
    }

    return this.repo.pure !== true
  }

  /**
   * Called when a presenter is created, before it has calculated a view model.
   * Useful for fetching data and other prep-work.
   */
  setup (repo, props, state) {
    // NOOP
  }

  /**
   * Called when a presenter gets new props. This is useful for secondary
   * data fetching and other work that must happen when a Presenter receives
   * new information
   */
  update (repo, props, state) {
    // NOOP
  }

  componentWillReceiveProps (next) {
    if (this._isImpure() || !shallowEqual(next, this.props)) {
      this.update(this.repo, next, this.state)
    }
  }

  /**
   * Opposite of setup. Useful for cleaning up side-effects.
   */
  teardown (repo, props, state) {
    // NOOP
  }

  /**
   * Expose "intent" subscriptions to child components. This is used with the <Form />
   * add-on to improve the ergonomics of presenter/view communication (though this only
   * occurs from the view to the presenter).
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
   */
  viewModel (props, state) {
    return state => state
  }

  /**
   * Alias for viewModel
   */
  model(props, state) {
    return this.viewModel(props, state)
  }

  view (model) {
    return this.props.children ? React.Children.only(this.props.children) : null
  }

  render() {
    // If the view is null, then it is probably incorrectly referenced
    if (this.view == null) {
      throw new TypeError(`${getName(this)}::view() is ` +
                          `${typeof this.view}. Is it referenced correctly?`)
    }

    return (
      <PresenterContext parentProps={this.props}
                        parentState={this.state}
                        presenter={this}
                        view={this.view}
                        repo={this.props.repo} />
    )
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

  constructor (props, context) {
    super(...arguments)

    this.repo = this.getRepo()

    this.props.presenter._connectSend(this.send.bind(this))
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  componentWillMount () {
    this.props.presenter._setRepo(this.repo)
    this.recalculate(this.props)
  }

  componentDidMount () {
    this.repo.on('change', this.updateState, this)
  }

  componentWillUnmount () {
    this.repo.teardown()
  }

  componentWillReceiveProps (next) {
    this.recalculate(next)
  }

  recalculate (props) {
    this.updatePropMap(props)
    this.updateState()
  }

  render () {
    const { presenter, parentProps } = this.props

    const model = merge({}, parentProps, this.state)

    if (presenter.view.contextTypes || presenter.view.prototype.isReactComponent) {
      return React.createElement(presenter.view, model)
    }

    return presenter.view(model)
  }

  getRepo () {
    const repo = this.props.repo || this.context.repo

    return repo ? repo.fork() : new Microcosm()
  }

  isImpure () {
    return this.props.presenter._isImpure()
  }

  updatePropMap ({ presenter, parentProps, parentState }) {
    this.propMap = presenter.model.call(presenter, parentProps, parentState)
  }

  updateState () {
    const next = this.getState()

    if (this.isImpure() || shallowEqual(this.state, next) === false) {
      return this.setState(next)
    }
  }

  getState () {
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
    const { presenter } = this.props

    const registry = presenter.register()

    // Tag intents so that they register the same way in the Presenter
    // and Microcosm instance
    intent = tag(intent)

    // Does the presenter register to this intent?
    if (registry && registry.hasOwnProperty(intent)) {
      return registry[intent].apply(presenter, [ this.repo, ...params ])
    }

    // No: try the parent presenter
    if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    // If we hit the top, push the intent into the Microcosm instance
    return this.repo.push(intent, ...params)
  }
}

export default Presenter
