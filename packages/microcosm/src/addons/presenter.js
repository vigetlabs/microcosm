/**
 * @fileoverview Presenter is a specialized React component that
 * creates a boundary between "smart" and "dumb" components. This
 * improves testing and keeps business logic in a consistent place
 * (instead of spread across bunches of components).
 *
 * Use Presenters to track changes to a Microcosm, push actions, and
 * manage application flow.
 * @flow
 */

import React from 'react'
import { Microcosm, merge, tag, getRegistration } from '../index'
import Model from './model'

function passChildren() {
  return this.props.children ? React.Children.only(this.props.children) : null
}

function renderMediator() {
  return React.createElement(PresenterMediator, {
    presenter: this,
    presenterProps: this.props,
    presenterState: this.state
  })
}

type Props = Object
type State = Object

class Presenter extends React.PureComponent<Props, State> {
  render: () => *
  defaultRender: () => *
  send: *
  repo: Microcosm
  mediator: PresenterMediator
  didFork: boolean
  model: Object
  view: *

  constructor(props: Props, context: Object) {
    super()

    if (this.render) {
      this.defaultRender = this.render
    } else {
      this.defaultRender = passChildren
    }

    // We need to wrap the children of this presenter in a
    // PresenterMediator component. This ensures that we can pass along
    // context in browsers that do not support static inheritence (IE10)
    // and allow overriding of lifecycle methods
    this.render = renderMediator

    // Autobind send so that context is maintained when passing send to children
    this.send = this.send.bind(this)
    this.state = {}
  }

  get model(): * {
    return this.mediator.model.value
  }

  /**
   * Called when a presenter is created, useful any prep work. `setup`
   * runs before the first `getModel` invocation.
   */
  setup(repo: Microcosm, props: Props, state: State) {
    // NOOP
  }

  /**
   * Called after the presenter has run `setup` and executed the first
   * `getModel`. This hook is useful for fetching initial data and
   * other start tasks that need access to the model data.
   */
  ready(repo: Microcosm, props: Props, state: State) {
    // NOOP
  }

  componentWillUpdate(props: Props, state: State) {
    this._updateModel(props, state)
    this.update(this.repo, props, state)
  }

  /**
   * Called when a presenter gets new props. This is useful for secondary
   * data fetching and other work that must happen when a Presenter receives
   * new information.
   */
  update(repo: Microcosm, nextProps: Props, nextState: State) {
    // NOOP
  }

  /**
   * Called before a model will change.
   */
  modelWillUpdate(repo: Microcosm, nextModel: Object, patch: Object) {
    // NOOP
  }

  /**
   * Runs when the presenter unmounts. Useful for tearing down
   * subscriptions and other setup behavior.
   */
  teardown(repo: Microcosm, props: Props, state: State) {
    // NOOP
  }

  /**
   * Catch an action emitted from a child view, using an add-on
   * `ActionForm`, `ActionButton`, or `withSend`. These add-ons are
   * designed to improve the ergonomics of presenter/view
   * communication. Data down, actions up.
   */
  intercept(): * {
    return null
  }

  /**
   * Runs before assigning a repo to a Presenter. This method is given
   * the parent repo, either passed in via `props` or `context`. By
   * default, it returns a fork of that repo, or a new Microcosm if no
   * repo is provided.
   *
   * This provides an opportunity to customize the repo behavior for a
   * particular Presenter. For example, to circumvent the default
   * Presenter forking behavior:
   */
  getRepo(repo: ?Microcosm, props: Props): Microcosm {
    return repo ? repo.fork() : new Microcosm()
  }

  /**
   * Bubble an action up through the presenter tree. If no parent
   * presenter responds to the action within their `intercept()`
   * method, then dispatch it to the root Microcosm repo.
   *
   * This works exactly like the `send` property passed into a
   * component that is wrapped in the `withSend` higher order
   * component.
   */
  send(command: Command | Tagged, ...params: *[]) {
    return this.mediator.send(command, ...params)
  }

  /**
   * Builds a view model for the current props and state. This must
   * return an object of key/value pairs.
   */
  getModel(presenterProps: Props, presenterState: State) {
    return {}
  }

  /* Private ------------------------------------------------------ */

  _updateModel(props: Props, state: State) {
    return this.mediator.model.bind(this.getModel(props, state))
  }

  _beginSetup(mediator: PresenterMediator) {
    this.repo = mediator.repo
    this.mediator = mediator

    this.setup(this.repo, this.props, this.state)

    this._updateModel(this.props, this.state)

    this.ready(this.repo, this.props, this.state)
  }

  _beginTeardown() {
    this.teardown(this.repo, this.props, this.state)
  }

  _requestRepo(contextRepo: ?Microcosm) {
    let givenRepo = this.props.repo || contextRepo
    let workingRepo = this.getRepo(givenRepo, this.props)

    this.didFork = workingRepo !== givenRepo

    return workingRepo
  }
}

class PresenterMediator extends React.Component<Props> {
  repo: Microcosm
  send: *
  presenter: Presenter
  model: Model

  constructor(props: Props, context: Object) {
    super(props, context)

    this.presenter = props.presenter
    this.repo = this.presenter._requestRepo(context.repo)

    this.model = new Model(this.repo, this.presenter)

    // The following methods are autobound to protect scope
    this.send = this.send.bind(this)
  }

  getChildContext() {
    return {
      repo: this.repo,
      send: this.send,
      parent: this
    }
  }

  componentWillMount() {
    this.presenter._beginSetup(this)
  }

  componentDidMount() {
    this.presenter.refs = this.refs

    this.model.on('change', this._modelDidUpdate, this)
    this.model.on('will-change', this._modelWillUpdate, this)
  }

  componentWillUnmount() {
    this.presenter.refs = this.refs

    if (this.presenter.didFork) {
      this.repo.shutdown()
    }

    this.model.teardown()

    this.presenter._beginTeardown()
  }

  render() {
    // Views can be getters, so pluck it out so that it is only evaluated once
    const { model, view } = this.presenter
    const { presenterProps } = this.props

    if (view != null) {
      return React.createElement(
        view,
        merge(presenterProps, { repo: this.repo, send: this.send }, model)
      )
    }

    return this.presenter.defaultRender()
  }

  send(intent: Command, ...params: *[]): * {
    let taggedIntent = tag(intent)
    let mediator = this

    while (mediator) {
      let handler = mediator._getHandler(taggedIntent)

      if (handler) {
        return handler.call(mediator.presenter, mediator.repo, ...params)
      }

      mediator = mediator._getParent()
    }

    // If we hit the top, push the intent into the Microcosm instance
    return this.repo.push(...arguments)
  }

  /* Private ------------------------------------------------------ */

  _modelWillUpdate(value: Object, patch: Object) {
    this.presenter.modelWillUpdate(this.repo, value, patch)
  }

  _modelDidUpdate() {
    this.forceUpdate()
  }

  _getParent(): ?PresenterMediator {
    return this.context.parent
  }

  _getHandler(intent: Tagged): * {
    let interceptors = this.presenter.intercept()

    // A presenter's register goes through the same registration steps
    // Get the first index because Presenters can not chain
    return getRegistration(interceptors, intent, 'resolve')[0]
  }
}

const noop = () => {}

PresenterMediator.contextTypes = {
  repo: noop,
  send: noop,
  parent: noop
}

PresenterMediator.childContextTypes = {
  repo: noop,
  send: noop,
  parent: noop
}

export default Presenter
