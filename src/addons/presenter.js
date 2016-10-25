import React from 'react'
import Microcosm from '../microcosm'
import merge from '../merge'
import tag from '../tag'
import shallowEqual from '../shallow-equal'

function wrappedRender () {
  return (
    <PresenterContext {...this.props} presenter={this}>
      {this.view}
    </PresenterContext>
  )
}

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
class Presenter extends React.Component {

  constructor(props, context) {
    super(props, context)

    // Allow overriding render, generate the context wrapper
    // upon instantiation
    this.originalRender = this.render
    this.render = wrappedRender
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
    return state => state
  }

  /**
   * Alias for viewModel
   */
  model(props) {
    return this.viewModel(props)
  }

  view (model) {
    return this.originalRender()
  }

  render() {
    return this.props.children ? React.Children.only(this.props.children) : null
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
    super(props, context)

    this.repo = this.getRepo()
  }

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send.bind(this)
    }
  }

  shouldComponentUpdate (props, state) {
    if (this.isImpure()) {
      return true
    }

    return !shallowEqual(props, this.props) || !shallowEqual(state, this.state)
  }

  componentWillMount () {
    this.props.presenter.setup(this.repo, this.safeProps(this.props))

    this.updatePropMap(this.props)
    this.updateState()
  }

  componentDidMount () {
    this.repo.on('change', this.updateState, this)
  }

  componentWillUnmount () {
    this.props.presenter.teardown(this.repo, this.safeProps(this.props))
    this.repo.teardown()
  }

  componentWillReceiveProps (next) {
    if (this.isImpure() || !shallowEqual(next, this.props)) {
      this.updatePropMap(next)
      this.props.presenter.update(this.repo, this.safeProps(next))
    }

    this.updateState()
  }

  render () {
    const { presenter } = this.props

    return presenter.view(merge({}, presenter.props, this.state))
  }

  getRepo () {
    const repo = this.props.repo || this.context.repo

    return repo ? repo.fork() : new Microcosm()
  }

  isImpure () {
    if (this.props.hasOwnProperty('pure')) {
      return this.props.pure !== true
    }

    return this.repo.pure !== true
  }

  safeProps (props) {
    return props.presenter.props
  }

  updatePropMap (props) {
    this.propMap = this.props.presenter.model(this.safeProps(props))
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
    const registry = this.props.presenter.register()

    // Tag intents so that they register the same way in the Presenter
    // and Microcosm instance
    intent = tag(intent)

    // Does the presenter register to this intent?
    if (registry && registry.hasOwnProperty(intent)) {
      return registry[intent].apply(this.props.presenter, [ this.repo, ...params ])
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
