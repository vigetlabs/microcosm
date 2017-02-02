import { Children, PropTypes, Component, PureComponent, createElement } from 'react'
import Microcosm, { merge, tag, inherit } from '../microcosm'

const EMPTY = {}

/**
 * PureComponent was only added recently, so fallback to the regular
 * component in cases where it doesn't exist
 */
const BaseComponent = PureComponent || Component

/**
 * A general component abstraction for high-responsibility React
 * components that interact with non-presentational logic so that the
 * majority of view code does not have to.
 */
function Presenter (props, context) {
  BaseComponent.call(this, props, context)

  // Do not overriding render, generate the context wrapper upon creation
  if (this.view === Presenter.prototype.view &&
      this.render !== Presenter.prototype.render) {
    this.view = this.render
    this.render = Presenter.prototype.render
   }
}

inherit(Presenter, BaseComponent, {
  constructor: Presenter,

  getRepo (repo, props) {
    return repo ? repo.fork() : new Microcosm()
  },

  _setRepo (repo) {
    this.repo = repo

    this.setup(repo, this.props, this.props.state)
  },

  _connectSend (send) {
    this.send = send
  },

  /**
   * Called when a presenter is created, before it has calculated a view model.
   * Useful for fetching data and other prep-work.
   */
  setup (repo, props, state) {
    // NOOP
  },

  /**
   * Called when a presenter gets new props. This is useful for secondary
   * data fetching and other work that must happen when a Presenter receives
   * new information
   */
  update (repo, props, state) {
    // NOOP
  },

  componentWillUpdate (next, state) {
    this.update(this.repo, next, state)
  },

  /**
   * Opposite of setup. Useful for cleaning up side-effects.
   */
  teardown (repo, props, state) {
    // NOOP
  },

  /**
   * Expose "intent" subscriptions to child components. This is used with the <Form />
   * add-on to improve the ergonomics of presenter/view communication (though this only
   * occurs from the view to the presenter).
   */
  register () {
    // NOOP
  },

  /**
   * Used by the presenter to calculate it's internal state. This function must return
   * an object who's keys will be assigned to state, and who's values are functions that
   * are given the repo state and can return a specific point in that state.
   *
   * If none of the keys have changed, `this.updateState` will not set a new state.
   */
  model (props, state, repo) {
    return EMPTY
  },

  view (model) {
    return this.props.children ? Children.only(this.props.children) : null
  },

  render () {
    return (
      createElement(PresenterContext, {
        parentProps : this.props,
        parentState : this.state,
        presenter   : this,
        view        : this.view,
        repo        : this.props.repo
      })
    )
  }
})

function PresenterContext (props, context) {
  BaseComponent.call(this, props, context)

  this.repo = this.getRepo()
  this.state = {}
  this.send = this.send.bind(this)

  props.presenter._connectSend(this.send)
}

inherit(PresenterContext, BaseComponent, {

  getChildContext () {
    return {
      repo : this.repo,
      send : this.send
    }
  },

  componentWillMount () {
    this.props.presenter._setRepo(this.repo)
    this.recalculate(this.props)
  },

  componentDidMount () {
    this.repo.on('change', this.updateState, this)
  },

  componentWillUnmount () {
    const { presenter, parentProps, parentState, repo } = this.props

    presenter.teardown(this.repo, parentProps, parentState)

    if (this.repo !== (repo || this.context.repo)) {
      this.repo.teardown()
    }
  },

  componentWillReceiveProps (next) {
    this.recalculate(next)
  },

  render () {
    const { presenter, parentProps } = this.props

    const model = merge(parentProps, { send: this.send, repo: this.repo }, this.state)

    if (presenter.hasOwnProperty('view') || presenter.view.prototype.isReactComponent) {
      return createElement(presenter.view, model)
    }

    return presenter.view(model)
  },

  getRepo () {
    const { presenter, parentProps, repo } = this.props

    return presenter.getRepo(repo || this.context.repo, parentProps)
  },

  updatePropMap ({ presenter, parentProps, parentState }) {
    this.propMap = presenter.model(parentProps, parentState, this.repo)
    this.propMapKeys = Object.keys(this.propMap || EMPTY)
  },

  recalculate (props) {
    this.updatePropMap(props)
    this.updateState()
  },

  updateState () {
    let next = this.getState()

    if (next) {
      this.setState(next)
    }
  },

  getState () {
    let repoState = this.repo.state

    if (typeof this.propMap === 'function') {
      return this.propMap(repoState)
    }

    let next = null

    for (var i = this.propMapKeys.length - 1; i >= 0; --i) {
      var key = this.propMapKeys[i]
      var entry = this.propMap[key]

      var value = typeof entry === 'function' ? entry(repoState) : entry

      if (this.state[key] !== value) {
        next = next || {}
        next[key] = value
      }
    }

    return next
  },

  /**
   * Provides a way for views to send messages back to the presenter
   * in a way that does not require passing callbacks down through the
   * view. This method is exposed by the Presenter via the React context
   * API.
   *
   * Send bubbles. If the closest presenter does not implement the intent,
   * it will check it's parent presenter. This repeats until there is no parent,
   * in which case it pushes to the repo.
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
      return registry[intent].call(presenter, this.repo, ...params)
    }

    // No: try the parent presenter
    if (this.context.send) {
      return this.context.send(intent, ...params)
    }

    // If we hit the top, push the intent into the Microcosm instance
    return this.repo.push(intent, ...params)
  }
})

PresenterContext.propTypes = {
  repo : PropTypes.object
}

PresenterContext.contextTypes = {
  repo : PropTypes.object,
  send : PropTypes.func
}

PresenterContext.childContextTypes = {
  repo : PropTypes.object,
  send : PropTypes.func
}

export default Presenter
