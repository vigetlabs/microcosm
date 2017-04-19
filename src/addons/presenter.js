import Microcosm, {
  get,
  merge,
  tag,
  inherit,
  getRegistration,
} from '../microcosm'
import { Children, PureComponent, createElement } from 'react'

function passChildren () {
  return this.props.children ? Children.only(this.props.children) : null
}

function Presenter (props, context) {
  PureComponent.apply(this, arguments)

  if (this.render !== Presenter.prototype.render) {
    this.defaultRender = this.render
    this.render = Presenter.prototype.render
  } else {
    this.defaultRender = passChildren
  }

  // Autobind send so that context is maintained when passing send to children
  this.send = this.send.bind(this)
}

inherit(Presenter, PureComponent, {
  _beginSetup (mediator) {
    this.repo = mediator.repo
    this.mediator = mediator

    this.setup(this.repo, this.props, this.state)

    this.model = this._prepareModel()

    this.ready(this.repo, this.props, this.state)
  },

  _beginTeardown () {
    this.teardown(this.repo, this.props, this.state)
  },

  _requestRepo (contextRepo) {
    let givenRepo = this.props.repo || contextRepo
    let workingRepo = this.getRepo(givenRepo, this.props, this.state)

    this.didFork = workingRepo !== givenRepo

    return workingRepo
  },

  _prepareModel (props = this.props, state = this.state) {
    return this.mediator.updateModel(props, state)
  },

  setup (repo, props, state) {
    // NOOP
  },

  ready (repo, props, state) {
    // NOOP
  },

  update (repo, props, state) {
    // NOOP
  },

  teardown (repo, props, state) {
    // NOOP
  },

  intercept () {
    return {}
  },

  componentWillUpdate (props, state) {
    this.model = this._prepareModel(props, state)
    this.update(this.repo, props, state)
  },

  getRepo (repo, props) {
    return repo ? repo.fork() : new Microcosm()
  },

  send () {
    return this.mediator.send(...arguments)
  },

  getModel (repo, props, state) {
    return {}
  },

  render () {
    return createElement(PresenterMediator, {
      presenter:   this,
      parentState: this.state,
      parentProps: this.props,
    })
  },
})

function PresenterMediator (props, context) {
  PureComponent.apply(this, arguments)

  this.presenter = props.presenter

  this.repo = this.presenter._requestRepo(context.repo)
  this.send = this.send.bind(this)
  this.state = { repo: this.repo, send: this.send }
}

inherit(PresenterMediator, PureComponent, {
  getChildContext () {
    return {
      repo: this.repo,
      send: this.send,
    }
  },

  componentWillMount () {
    if (this.presenter.getModel !== Presenter.prototype.getModel) {
      this.repo.on('change', this.setModel, this)
    }

    this.presenter._beginSetup(this)
  },

  componentDidMount () {
    this.presenter.refs = this.refs
  },

  componentWillUnmount () {
    this.presenter.refs = this.refs

    this.repo.off('change', this.setModel, this)

    if (this.presenter.didFork) {
      this.repo.shutdown()
    }

    this.presenter._beginTeardown()
  },

  render () {
    // setState might have been called before the model
    // can get assigned
    this.presenter.model = this.state

    // Views can be getters, so pluck it out so that it is only evaluated once
    const view = this.presenter.view

    if (view != null) {
      return createElement(view, merge(this.presenter.props, this.state))
    }

    return this.presenter.defaultRender()
  },

  updateModel (props, state) {
    let model = this.presenter.getModel(props, state)
    let data = this.repo.state
    let next = {}

    this.propMap = {}

    for (var key in model) {
      var entry = model[key]

      if (typeof entry === 'function') {
        this.propMap[key] = entry
        next[key] = entry(data)
      } else {
        next[key] = entry
      }
    }

    this.setState(next)

    return merge(this.state, next)
  },

  setModel (state) {
    let last = this.state
    let next = null

    for (var key in this.propMap) {
      var value = this.propMap[key](state)

      if (last[key] !== value) {
        next = next || {}
        next[key] = value
      }
    }

    if (next !== null) {
      this.setState(next)
    }
  },

  hasParent () {
    // Do not allow transfer across repos. Check to for inheritence by comparing
    // the common history object shared between repos
    return get(this.repo, 'history') === get(this.context, ['repo', 'history'])
  },

  send (intent, ...params) {
    // tag intent first so the interceptor keys off the right key
    let taggedIntent = tag(intent)

    let interceptors = this.presenter.intercept()

    // A presenter's register goes through the same registration steps
    let handler = getRegistration(interceptors, taggedIntent, 'resolve')

    // Does the presenter register to this intent?
    if (handler) {
      return handler.call(this.presenter, this.repo, ...params)
    }

    // No: try the parent presenter
    if (this.hasParent()) {
      return this.context.send.apply(null, arguments)
    }

    // If we hit the top, push the intent into the Microcosm instance
    return this.repo.push.apply(this.repo, arguments)
  },
})

const identity = () => {}

PresenterMediator.contextTypes = {
  repo: identity,
  send: identity,
}

PresenterMediator.childContextTypes = {
  repo: identity,
  send: identity,
}

export default Presenter
