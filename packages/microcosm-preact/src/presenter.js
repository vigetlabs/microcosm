/**
 * @fileoverview Presenter is a specialized React component that
 * creates a boundary between "smart" and "dumb" components. This
 * improves testing and keeps business logic in a consistent place
 * (instead of spread across bunches of components).
 *
 * Use Presenters to track changes to a Microcosm, push actions, and
 * manage application flow.
 */

import { h, Component } from 'preact'
import Microcosm, { merge, tag, getRegistration } from 'microcosm'
import Model from 'microcosm/addons/model'
import { requestFrame, cancelFrame } from './frame'

function passChildren() {
  return this.props.children[0]
}

function renderMediator() {
  return h(PresenterMediator, {
    presenter: this,
    presenterProps: this.props,
    presenterState: this.state
  })
}

function shallowDiffers(a, b) {
  for (let key in a) if (a[key] !== b[key]) return true
  for (let key in b) if (!(key in a)) return true
  return false
}

class Presenter extends Component {
  constructor(props, context) {
    super()

    if (this.constructor.prototype.hasOwnProperty('render')) {
      this.defaultRender = this.render
    } else {
      this.defaultRender = passChildren
    }

    this.render = renderMediator

    this.send = this.send.bind(this)
    this.state = {}
  }

  shouldComponentUpdate(props, state) {
    return (
      shallowDiffers(props, this.props) || shallowDiffers(state, this.state)
    )
  }

  get model() {
    return this.mediator.model.value
  }

  /**
   * Called when a presenter is created, useful any prep work. `setup`
   * runs before the first `getModel` invocation.
   */
  setup(repo, props, state) {
    // NOOP
  }

  ready(repo, props, state) {
    // NOOP
  }

  componentWillUpdate(props, state) {
    this._updateModel(props, state)
    this.update(this.repo, props, state)
  }

  update(repo, nextProps, nextState) {
    // NOOP
  }

  modelWillUpdate(repo, nextModel, patch) {
    // NOOP
  }

  teardown(repo, props, state) {
    // NOOP
  }

  intercept() {
    return null
  }

  getRepo(repo, props) {
    return repo ? repo.fork() : new Microcosm()
  }

  send(command, ...params) {
    return this.mediator.send(command, ...params)
  }

  getModel(presenterProps, presenterState) {
    return {}
  }

  /* Private ------------------------------------------------------ */

  _updateModel(props, state) {
    return this.mediator.model.bind(this.getModel(props, state))
  }

  _beginSetup(mediator) {
    this.repo = mediator.repo
    this.mediator = mediator

    this.setup(this.repo, this.props, this.state)

    this._updateModel(this.props, this.state)

    this.ready(this.repo, this.props, this.state)
  }

  _beginTeardown() {
    this.teardown(this.repo, this.props, this.state)
  }

  _requestRepo(contextRepo) {
    let givenRepo = this.props.repo || contextRepo
    let workingRepo = this.getRepo(givenRepo, this.props)

    this.didFork = workingRepo !== givenRepo

    return workingRepo
  }
}

class PresenterMediator extends Component {
  constructor(props, context) {
    super(props, context)

    this.presenter = props.presenter
    this.repo = this.presenter._requestRepo(context.repo)
    this._lastRevision = -Infinity

    this.model = new Model(this.repo, this.presenter)

    // The following methods are autobound to protect scope
    this.send = this.send.bind(this)
    this._scheduleUpdate = this._scheduleUpdate.bind(this)
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

    this.model.on('change', this._queueUpdate, this)
    this.model.on('will-change', this._preUpdate, this)
  }

  componentWillUnmount() {
    this.presenter.refs = this.refs

    if (this.presenter.didFork) {
      this.repo.shutdown()
    }

    this.model.teardown()

    this.presenter._beginTeardown()

    this._stopUpdate()
  }

  render() {
    // Views can be getters, so pluck it out so that it is only evaluated once
    const { model, view } = this.presenter
    const { presenterProps } = this.props

    this._lastRevision = this.model.revision

    if (view != null) {
      return h(
        view,
        merge(presenterProps, { repo: this.repo, send: this.send }, model)
      )
    }

    return this.presenter.defaultRender(
      this.presenter.props,
      this.presenter.state,
      this.presenter.model
    )
  }

  send(intent, ...params) {
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

  _preUpdate(value, patch) {
    this.presenter.modelWillUpdate(this.repo, value, patch)
  }

  _scheduleUpdate() {
    if (this.model.revision > this._lastRevision) {
      this.forceUpdate()
    }

    this._scheduledFrame = null
  }

  _queueUpdate() {
    if (this.repo.history.batch && !this._scheduledFrame) {
      this._scheduledFrame = requestFrame(this._scheduleUpdate)
    } else {
      this._scheduleUpdate()
    }
  }

  _stopUpdate() {
    if (this._scheduledFrame) {
      cancelFrame(this._scheduledFrame)
      this._scheduledFrame = null
    }
  }

  _getParent() {
    return this.context.parent
  }

  _getHandler(intent) {
    let interceptors = this.presenter.intercept()

    // A presenter's register goes through the same registration steps
    // Get the first index because Presenters can not chain
    return getRegistration(interceptors, intent, 'resolve')[0]
  }
}

export default Presenter
